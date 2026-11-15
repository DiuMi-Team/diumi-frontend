import type { OrderState } from "@/features/order/order";

/** 실전모드 화면 */
export type RealScreen =
  | "intro"
  | "dine"
  | "menu"
  | "options"
  | "paidOptions"
  | "freeOptions"
  | "cart"
  | "membership"
  | "paymentMethod"
  | "payMobile"
  | "payGiftCard"
  | "payCard"
  | "done"
  | "result";

/** 결제를 마친 뒤의 화면. 되돌아갈 수 없어 내비 바와 음성 도우미를 숨긴다 */
export const FINISHED_SCREENS: readonly RealScreen[] = ["done", "result"];

/** 미션 진행 표시 (총 9단계). 메뉴 화면은 장바구니가 차 있으면 "메뉴를 더 담는" 4단계다 */
export function realProgress(
  screen: Exclude<RealScreen, "intro" | "result">,
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
    case "paymentMethod":
      return { step: 7, label: "결제 방식" };
    case "payMobile":
      return { step: 8, label: "결제 · 모바일페이" };
    case "payGiftCard":
      return { step: 8, label: "결제 · 기프트카드" };
    case "payCard":
      return { step: 8, label: "결제 · 신용·체크카드" };
    case "done":
      return { step: 9, label: "결제 완료" };
  }
}
