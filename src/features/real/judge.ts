import { getCafeMenu, SIZE_LABEL, TEMPERATURE_LABEL } from "@/features/cafe/catalog";
import type { DrinkItem, OrderState } from "@/features/order/order";
import { PAYMENT_LABEL, realDrinkName } from "@/features/real/labels";
import type { RealMission } from "@/features/real/missions";

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

const DINE_NAME = { dineIn: "매장", takeout: "포장" } as const;

/**
 * 결제를 마친 주문이 미션대로인지 판정한다. 완료 조건마다 맞았는지와, 틀렸다면 무엇이 달랐는지 돌려준다.
 * 조건 순서는 미션의 완료 조건 순서와 같다: 메뉴 → 사이즈·수량 → 이용 방법 → 결제 방법.
 */
export function judgeMission(mission: RealMission, order: OrderState): MissionJudgement {
  const [target] = mission.expected.cart;
  const drinks = order.cart.filter((item): item is DrinkItem => item.type === "drink");
  const sameMenu = drinks.filter((item) => item.menuId === target.menuId);
  const others = drinks.filter((item) => item.menuId !== target.menuId);
  const menuName = getCafeMenu(target.menuId as DrinkItem["menuId"]).name;

  /* 1. 메뉴와 온도 */
  const menuDiffs: string[] = [];
  if (sameMenu.length === 0) {
    menuDiffs.push(`메뉴: ${menuName}가 담기지 않았어요`);
  } else if (
    target.temperature &&
    sameMenu.some((item) => item.temperature !== target.temperature)
  ) {
    const picked = sameMenu.find((item) => item.temperature !== target.temperature)!;
    menuDiffs.push(
      `온도: ${TEMPERATURE_LABEL[picked.temperature]}${picked.temperature === "hot" ? "을" : "를"} 골랐어요 → 미션은 ${TEMPERATURE_LABEL[target.temperature]}`,
    );
  }
  if (others.length > 0) {
    const extra = others.map((item) => `${realDrinkName(item)} ${item.quantity}잔`).join(", ");
    menuDiffs.push(`미션에 없는 메뉴도 담았어요: ${extra}`);
  }

  /* 2. 사이즈와 수량 */
  const sizeDiffs: string[] = [];
  const wrongSize = sameMenu.find((item) => target.size && item.size !== target.size);
  if (wrongSize && target.size) {
    sizeDiffs.push(
      `사이즈: ${SIZE_LABEL[wrongSize.size]}를 골랐어요 → 미션은 ${SIZE_LABEL[target.size as DrinkItem["size"]]}`,
    );
  }
  const quantity = sameMenu.reduce((sum, item) => sum + item.quantity, 0);
  if (sameMenu.length > 0 && quantity !== target.quantity) {
    sizeDiffs.push(`수량: ${quantity}잔 → 미션은 ${target.quantity}잔`);
  }

  /* 3. 이용 방법 */
  const dineDiffs: string[] = [];
  const expectedDine = mission.expected.dineOption;
  if (expectedDine && order.dineOption !== expectedDine) {
    dineDiffs.push(
      order.dineOption
        ? `이용 방법: ${DINE_NAME[order.dineOption]}을 골랐어요 → 미션은 ${DINE_NAME[expectedDine]}`
        : `이용 방법을 고르지 않았어요 → 미션은 ${DINE_NAME[expectedDine]}`,
    );
  }

  /* 4. 결제 방법 */
  const payDiffs: string[] = [];
  const expectedPay = mission.expected.paymentMethod;
  if (expectedPay && order.paymentMethod !== expectedPay) {
    payDiffs.push(
      order.paymentMethod
        ? `결제: ${PAYMENT_LABEL[order.paymentMethod]}로 결제했어요 → 미션은 ${PAYMENT_LABEL[expectedPay]}`
        : `결제를 마치지 않았어요 → 미션은 ${PAYMENT_LABEL[expectedPay]}`,
    );
  }

  const conditions = [menuDiffs, sizeDiffs, dineDiffs, payDiffs].map((differences, index) => ({
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
