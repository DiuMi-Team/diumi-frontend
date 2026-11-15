import type { OrderState } from "@/features/order/order";

/** 실전모드 화면. 결제 이후 화면은 다음 이슈에서 추가한다 */
export type RealScreen =
  "intro" | "dine" | "menu" | "options" | "paidOptions" | "freeOptions" | "cart" | "membership";

/** 미션 진행 표시 (총 9단계). 메뉴 화면은 장바구니가 차 있으면 "메뉴를 더 담는" 4단계다 */
export function realProgress(
  screen: Exclude<RealScreen, "intro">,
  order: Pick<OrderState, "cart">,
): { step: number; label: string } {
  switch (screen) {
    case "dine":
      return { step: 1, label: "이용 방법" };
    case "menu":
      return order.cart.length === 0
        ? { step: 2, label: "메뉴 선택" }
        : { step: 4, label: "메뉴 선택" };
    case "options":
      return { step: 3, label: "옵션 선택" };
    case "paidOptions":
      return { step: 3, label: "옵션 선택 · 유료 옵션" };
    case "freeOptions":
      return { step: 3, label: "옵션 선택 · 무료 옵션" };
    case "cart":
      return { step: 5, label: "장바구니" };
    case "membership":
      return { step: 6, label: "혜택" };
  }
}
