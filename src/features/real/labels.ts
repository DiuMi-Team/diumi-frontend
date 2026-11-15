import { getCafeMenu, SIZE_LABEL } from "@/features/cafe/catalog";
import {
  freeOptionSummaries,
  selectedPaidOptions,
  type DineOption,
  type DrinkItem,
  type OrderState,
  type PaymentMethod,
} from "@/features/order/order";

/* 실전 키오스크의 음료 이름 표기. 연습과 달리 온도와 사이즈를 이름에 붙인다 */

/** "아이스 아메리카노 Large" */
export function realDrinkName(item: Pick<DrinkItem, "menuId" | "temperature" | "size">): string {
  const prefix =
    item.temperature === "ice" ? "아이스 " : item.temperature === "hot" ? "따뜻한 " : "";
  return `${prefix}${getCafeMenu(item.menuId).name} ${SIZE_LABEL[item.size]}`;
}

const DINE_LABEL: Record<DineOption, string> = { dineIn: "매장", takeout: "포장" };

/** "기본 옵션 · 포장", "휘핑크림 · 얼음 적게 · 포장" */
export function realDrinkDetail(
  item: Pick<DrinkItem, "paidOptions" | "freeOptions">,
  dineOption: DineOption | null,
): string {
  const options = [
    ...selectedPaidOptions(item.paidOptions).map(([option, count]) =>
      count > 1 ? `${option.name} ${count}` : option.name,
    ),
    ...freeOptionSummaries(item.freeOptions),
  ];
  return [
    options.length > 0 ? options.join(" · ") : "기본 옵션",
    dineOption && DINE_LABEL[dineOption],
  ]
    .filter(Boolean)
    .join(" · ");
}

export const PAYMENT_LABEL: Record<PaymentMethod, string> = {
  card: "신용·체크카드",
  mobilePay: "모바일페이",
  giftCard: "기프트카드",
};

const PAYMENT_SHORT: Record<PaymentMethod, string> = {
  card: "카드",
  mobilePay: "모바일페이",
  giftCard: "기프트카드",
};

/** 결과 화면의 완료한 주문. 예: "아이스 아메리카노 Large 2잔 · 포장 · 카드 결제" */
export function realOrderSummary(order: OrderState): string {
  const items = order.cart
    .map((item) => (item.type === "drink" ? `${realDrinkName(item)} ${item.quantity}잔` : ""))
    .filter(Boolean)
    .join(", ");
  return [
    items,
    order.dineOption && DINE_LABEL[order.dineOption],
    order.paymentMethod && `${PAYMENT_SHORT[order.paymentMethod]} 결제`,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** 125000ms → "2분 5초" */
export function formatDuration(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return minutes > 0 ? `${minutes}분 ${rest}초` : `${rest}초`;
}
