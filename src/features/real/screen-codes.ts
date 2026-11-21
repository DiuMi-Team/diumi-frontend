import type { OrderState } from "@/features/order/order";
import type { PracticeService } from "@/features/practice/types";
import type { RealScreen } from "@/features/real/flow";

/**
 * AI 음성 연결(API 8)에 보내는 화면 코드. 백엔드가 이 코드로 화면에 맞는 안내 규칙을 고른다.
 * 백엔드가 정한 목록만 받는다(대문자, 목록 밖이면 400). 단계 코드(PAYMENT 등)를 그대로 보내면 안 된다.
 *
 * 카페: MISSION_BRIEFING, SELECT_ORDER_TYPE, SELECT_MENU, SELECT_OPTION, SELECT_QUANTITY, CART,
 *       MEMBERSHIP, ORDER_REVIEW, SELECT_PAYMENT, PAY_CARD, PAY_MOBILE, PAY_BARCODE, ORDER_COMPLETE, COMMON
 * 패스트푸드: 위 목록 + SELECT_CATEGORY, SELECT_MEAL_TYPE, SELECT_SET_SIZE, SELECT_SIDE, SELECT_DRINK,
 *       SELECT_EXTRA_MENU
 */
export type ScreenCode =
  | "COMMON"
  | "MISSION_BRIEFING"
  | "SELECT_ORDER_TYPE"
  | "SELECT_MENU"
  | "SELECT_EXTRA_MENU"
  | "SELECT_OPTION"
  | "SELECT_MEAL_TYPE"
  | "SELECT_SIDE"
  | "SELECT_DRINK"
  | "SELECT_QUANTITY"
  | "CART"
  | "MEMBERSHIP"
  | "ORDER_REVIEW"
  | "SELECT_PAYMENT"
  | "PAY_CARD"
  | "PAY_MOBILE"
  | "PAY_BARCODE"
  | "ORDER_COMPLETE";

export function screenCode(
  service: PracticeService,
  screen: RealScreen,
  order: Pick<OrderState, "cart" | "draft">,
): ScreenCode {
  switch (screen) {
    case "intro":
      return "MISSION_BRIEFING";
    case "dine":
      return "SELECT_ORDER_TYPE";
    case "menu":
      // 패스트푸드는 장바구니에 담은 뒤 다시 메뉴판으로 오면 "메뉴 더 고르기" 화면이다
      return service === "fastfood" && order.cart.length > 0 ? "SELECT_EXTRA_MENU" : "SELECT_MENU";
    case "options":
    case "paidOptions":
    case "freeOptions":
      return "SELECT_OPTION";
    case "setChoice":
      return "SELECT_MEAL_TYPE";
    case "setCompose":
      // 사이드·음료를 한 화면에서 고른다. 사이드를 골랐으면 음료 안내로 넘긴다
      return order.draft?.type === "burger" && order.draft.side ? "SELECT_DRINK" : "SELECT_SIDE";
    case "burgerConfirm":
      return "SELECT_QUANTITY";
    case "cart":
      return "CART";
    case "membership":
      return "MEMBERSHIP";
    case "orderReview":
      return "ORDER_REVIEW";
    case "paymentMethod":
      return "SELECT_PAYMENT";
    case "payCard":
      return "PAY_CARD";
    case "payMobile":
      return "PAY_MOBILE";
    case "payGiftCard":
      return "PAY_BARCODE";
    case "done":
    case "result":
      return "ORDER_COMPLETE";
  }
}
