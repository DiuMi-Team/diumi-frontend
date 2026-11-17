import { getCafeMenu, SIZE_LABEL, TEMPERATURE_LABEL } from "@/features/cafe/catalog";
import { getBurger, getSetDrink, getSide } from "@/features/fastfood/catalog";
import {
  itemName,
  type BurgerItem,
  type CartItem,
  type DineOption,
  type DrinkItem,
  type OrderState,
} from "@/features/order/order";
import { PAYMENT_LABEL, realDrinkName } from "@/features/real/labels";
import type { ExpectedItem, RealMission } from "@/features/real/missions";

export type ConditionResult = {
  /** 완료 조건 문구. 예: "포장 선택" */
  label: string;
  ok: boolean;
  /** 틀렸을 때 미션과 다른 점. 예: "사이즈: Extra를 골랐어요 → 미션은 Large" */
  differences: string[];
};

export type MissionJudgement = {
  success: boolean;
  /** 맞힌 완료 조건 비율 (0~100) */
  percent: number;
  conditions: ConditionResult[];
};

const DINE_NAME: Record<DineOption, string> = { dineIn: "매장", takeout: "포장" };

/**
 * 목적격 조사. 한글은 받침이 있으면 "을", 없으면 "를".
 * 영어는 읽었을 때 끝소리로 정한다 (HOT·ICE → 을·를, Large·Extra·Regular → 를).
 */
export function objectParticle(word: string): "을" | "를" {
  const last = word.trim().at(-1) ?? "";
  const code = last.charCodeAt(0) - 0xac00;
  if (code >= 0 && code <= 11171) return code % 28 === 0 ? "를" : "을";
  return /[lmnt]$/i.test(word.trim()) && !/(ar|ra|ge)$/i.test(word.trim()) ? "을" : "를";
}

const differ = (topic: string, picked: string, expected: string) =>
  `${topic}: ${picked}${objectParticle(picked)} 골랐어요 → 미션은 ${expected}`;

function itemLabel(item: CartItem): string {
  return item.type === "drink"
    ? `${realDrinkName(item)} ${item.quantity}잔`
    : `${itemName(item)} ${item.quantity}개`;
}

/**
 * 결제를 마친 주문이 미션대로인지 판정한다. 완료 조건마다 맞았는지와, 틀렸다면 무엇이 달랐는지 돌려준다.
 * 조건 순서는 미션의 완료 조건 순서와 같다.
 * - 카페: 메뉴·온도 → 사이즈·수량 → 이용 방법 → 결제 방법
 * - 패스트푸드: 이용 방법 → 버거·구성·수량 → 사이드·음료 → 결제 방법
 */
export function judgeMission(mission: RealMission, order: OrderState): MissionJudgement {
  const { item, dineOption, paymentMethod } = mission.expected;
  const dine = judgeDine(order, dineOption);
  const pay = judgePayment(order, paymentMethod);

  const groups =
    item.type === "drink"
      ? [...judgeDrink(order, item), dine, pay]
      : [dine, ...judgeBurger(order, item), pay];

  const conditions = groups.map((differences, index) => ({
    label: mission.conditions[index],
    ok: differences.length === 0,
    differences,
  }));
  const passed = conditions.filter((condition) => condition.ok).length;

  return {
    success: passed === conditions.length,
    percent: Math.round((passed / conditions.length) * 100),
    conditions,
  };
}

function judgeDine(order: OrderState, expected: DineOption): string[] {
  if (order.dineOption === expected) return [];
  return [
    order.dineOption
      ? differ("이용 방법", DINE_NAME[order.dineOption], DINE_NAME[expected])
      : `이용 방법을 고르지 않았어요 → 미션은 ${DINE_NAME[expected]}`,
  ];
}

function judgePayment(order: OrderState, expected: OrderState["paymentMethod"]): string[] {
  if (!expected || order.paymentMethod === expected) return [];
  return [
    order.paymentMethod
      ? `결제: ${PAYMENT_LABEL[order.paymentMethod]}로 결제했어요 → 미션은 ${PAYMENT_LABEL[expected]}`
      : `결제를 마치지 않았어요 → 미션은 ${PAYMENT_LABEL[expected]}`,
  ];
}

/** 카페: [메뉴·온도, 사이즈·수량] */
function judgeDrink(order: OrderState, target: Extract<ExpectedItem, { type: "drink" }>) {
  const same = order.cart.filter(
    (item): item is DrinkItem => item.type === "drink" && item.menuId === target.menuId,
  );
  const others = order.cart.filter((item) => !same.includes(item as DrinkItem));

  const menu: string[] = [];
  if (same.length === 0) {
    menu.push(`메뉴: ${getCafeMenu(target.menuId).name}가 담기지 않았어요`);
  } else {
    const wrong = same.find((item) => item.temperature !== target.temperature);
    if (wrong) {
      menu.push(
        differ("온도", TEMPERATURE_LABEL[wrong.temperature], TEMPERATURE_LABEL[target.temperature]),
      );
    }
  }
  if (others.length > 0) {
    menu.push(`미션에 없는 메뉴도 담았어요: ${others.map(itemLabel).join(", ")}`);
  }

  const sizeQuantity: string[] = [];
  const wrongSize = same.find((item) => item.size !== target.size);
  if (wrongSize) {
    sizeQuantity.push(differ("사이즈", SIZE_LABEL[wrongSize.size], SIZE_LABEL[target.size]));
  }
  const quantity = same.reduce((sum, item) => sum + item.quantity, 0);
  if (same.length > 0 && quantity !== target.quantity) {
    sizeQuantity.push(`수량: ${quantity}잔 → 미션은 ${target.quantity}잔`);
  }

  return [menu, sizeQuantity];
}

/** 패스트푸드: [버거·구성·수량, 사이드·음료] */
function judgeBurger(order: OrderState, target: Extract<ExpectedItem, { type: "burger" }>) {
  const same = order.cart.filter(
    (item): item is BurgerItem => item.type === "burger" && item.menuId === target.menuId,
  );
  const others = order.cart.filter((item) => !same.includes(item as BurgerItem));
  const setName = (set: boolean) => (set ? "세트" : "단품");

  const menu: string[] = [];
  if (same.length === 0) {
    menu.push(`메뉴: ${getBurger(target.menuId).name}가 담기지 않았어요`);
  } else {
    const wrongSet = same.find((item) => item.set !== target.set);
    if (wrongSet) menu.push(differ("구성", setName(wrongSet.set), setName(target.set)));
    const quantity = same.reduce((sum, item) => sum + item.quantity, 0);
    if (quantity !== target.quantity) {
      menu.push(`수량: ${quantity}개 → 미션은 ${target.quantity}개`);
    }
  }
  if (others.length > 0) {
    menu.push(`미션에 없는 메뉴도 담았어요: ${others.map(itemLabel).join(", ")}`);
  }

  const sideDrink: string[] = [];
  if (target.set && target.side && target.drink) {
    const set = same.find((item) => item.set);
    if (!set || !set.side || !set.drink) {
      sideDrink.push(
        `사이드·음료를 고르지 않았어요 → 미션은 ${getSide(target.side).name} · ${getSetDrink(target.drink).name}`,
      );
    } else {
      if (set.side !== target.side) {
        sideDrink.push(differ("사이드", getSide(set.side).name, getSide(target.side).name));
      }
      if (set.drink !== target.drink) {
        sideDrink.push(differ("음료", getSetDrink(set.drink).name, getSetDrink(target.drink).name));
      }
    }
  }

  return [menu, sideDrink];
}
