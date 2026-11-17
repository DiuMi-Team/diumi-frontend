import type { OrderState } from "@/features/order/order";
import type { PracticeService } from "@/features/practice/types";

/** 실전모드 화면. 카페와 패스트푸드가 함께 쓰는 화면과 한쪽만 쓰는 화면이 섞여 있다 */
export type RealScreen =
  | "intro"
  | "dine"
  | "menu"
  /* 카페 */
  | "options"
  | "paidOptions"
  | "freeOptions"
  | "cart"
  | "membership"
  /* 패스트푸드 */
  | "setChoice"
  | "setCompose"
  | "burgerConfirm"
  | "orderReview"
  /* 결제 이후 */
  | "paymentMethod"
  | "payMobile"
  | "payGiftCard"
  | "payCard"
  | "done"
  | "result";

/** 결제를 마친 뒤의 화면. 되돌아갈 수 없어 내비 바와 음성 도우미를 숨긴다 */
export const FINISHED_SCREENS: readonly RealScreen[] = ["done", "result"];

type Progress = { step: number; label: string };

const PAY_PROGRESS = {
  payMobile: "결제 · 모바일페이",
  payGiftCard: "결제 · 기프트카드",
  payCard: "결제 · 신용·체크카드",
} as const;

/**
 * 미션 진행 표시 (총 9단계).
 * - 카페: 이용 방법 → 메뉴 → 옵션 → (메뉴 더 담기) → 장바구니 → 혜택 → 결제 방식 → 결제 → 완료
 * - 패스트푸드: 이용 방법 → 메뉴 → 구성 → 사이드·음료 → 장바구니 담기 → (메뉴 더 고르기) → 주문 확인 → 결제 → 완료
 * 메뉴 화면은 장바구니가 차 있으면 "메뉴를 더 담는" 단계로 센다.
 */
export function realProgress(
  screen: Exclude<RealScreen, "intro" | "result">,
  order: Pick<OrderState, "cart">,
  service: PracticeService = "cafe",
): Progress {
  const cartFilled = order.cart.length > 0;
  if (screen === "dine") return { step: 1, label: "이용 방법" };
  if (screen === "done") return { step: 9, label: "결제 완료" };
  if (screen in PAY_PROGRESS) {
    return { step: 8, label: PAY_PROGRESS[screen as keyof typeof PAY_PROGRESS] };
  }

  if (service === "fastfood") {
    const steps: Partial<Record<RealScreen, Progress>> = {
      menu: { step: cartFilled ? 6 : 2, label: "메뉴 선택" },
      setChoice: { step: 3, label: "구성 선택" },
      setCompose: { step: 4, label: "사이드·음료" },
      burgerConfirm: { step: 5, label: "장바구니 담기" },
      orderReview: { step: 7, label: "주문 확인" },
      paymentMethod: { step: 8, label: "결제 방법" },
    };
    return steps[screen] ?? { step: 1, label: "" };
  }

  const steps: Partial<Record<RealScreen, Progress>> = {
    menu: { step: cartFilled ? 4 : 2, label: "메뉴 선택" },
    options: { step: 3, label: "옵션 선택" },
    paidOptions: { step: 3, label: "옵션 선택 · 유료 옵션" },
    freeOptions: { step: 3, label: "옵션 선택 · 무료 옵션" },
    cart: { step: 5, label: "장바구니" },
    membership: { step: 6, label: "혜택" },
    paymentMethod: { step: 7, label: "결제 방식" },
  };
  return steps[screen] ?? { step: 1, label: "" };
}
