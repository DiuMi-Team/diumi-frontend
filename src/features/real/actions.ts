import {
  getCafeMenu,
  SIZE_LABEL,
  TEMPERATURE_LABEL,
  type CafeMenuId,
  type CupSize,
  type Temperature,
} from "@/features/cafe/catalog";
import {
  getBurger,
  getSetDrink,
  getSide,
  type BurgerId,
  type SetDrinkId,
  type SideId,
} from "@/features/fastfood/catalog";
import type {
  CartItem,
  DineOption,
  OrderAction,
  OrderState,
  PaymentMethod,
} from "@/features/order/order";
import type { PracticeService } from "@/features/practice/types";
import type { RealScreen } from "@/features/real/flow";
import { PAYMENT_LABEL } from "@/features/real/labels";

/**
 * 화면 동작 → 백엔드 행동(action_type·target_code·action_data).
 * 백엔드는 단계마다 정해진 행동과 비교해 맞다·틀리다(is_valid)를 판정한다.
 * 코드는 대문자 그대로 보낸다. 표에 없는 메뉴·옵션(콜드브루, 매운버거, Extra 사이즈 등)은
 * 같은 규칙으로 만든 코드를 보내고, 백엔드는 미션과 다른 선택으로 판정한다.
 */

export type BackendActionType = "SELECT" | "OPTION" | "QUANTITY" | "NEXT" | "PAY" | "BACK" | "HOME";

export type BackendAction = {
  actionType: BackendActionType;
  targetCode?: string;
  actionData?: Record<string, unknown>;
};

const DINE: Record<DineOption, string> = { dineIn: "ORDER_EAT_IN", takeout: "ORDER_TAKE_OUT" };
const CAFE_MENU: Record<CafeMenuId, string> = {
  americano: "MENU_AMERICANO",
  latte: "MENU_CAFE_LATTE",
  mocha: "MENU_CAFE_MOCHA",
  coldbrew: "MENU_COLD_BREW",
};
const TEMPERATURE: Record<Temperature, string> = { hot: "TEMP_HOT", ice: "TEMP_ICE" };
const SIZE: Record<CupSize, string> = {
  regular: "SIZE_REGULAR",
  large: "SIZE_LARGE",
  extra: "SIZE_EXTRA",
};
const BURGER: Record<BurgerId, string> = {
  bulgogi: "MENU_BULGOGI_BURGER",
  chicken: "MENU_CHICKEN_BURGER",
  cheese: "MENU_CHEESE_BURGER",
  spicy: "MENU_SPICY_BURGER",
};
const SIDE: Record<SideId, string> = {
  fries: "SIDE_FRIES",
  salad: "SIDE_SALAD",
  nuggets: "SIDE_NUGGETS",
};
const DRINK: Record<SetDrinkId, string> = {
  cola: "DRINK_COLA",
  zero: "DRINK_ZERO_COLA",
  orange: "DRINK_ORANGE",
};
const PAYMENT: Record<PaymentMethod, string> = {
  card: "PAY_CARD",
  mobilePay: "PAY_MOBILE",
  giftCard: "PAY_GIFT_CARD",
};

/**
 * 백엔드 코드 → 화면에 보여 줄 이름.
 * 백엔드 코드표에 없는 선택지(콜드브루, 샐러드 등)는 서버 결과 문장에 코드가 그대로 와서,
 * 결과 화면에서 이 이름으로 바꿔 보여 준다.
 */
export const CODE_LABELS: Readonly<Record<string, string>> = Object.fromEntries([
  ...Object.entries(DINE).map(([id, code]) => [code, id === "dineIn" ? "매장 식사" : "포장"]),
  ...Object.entries(CAFE_MENU).map(([id, code]) => [code, getCafeMenu(id as CafeMenuId).name]),
  ...Object.entries(TEMPERATURE).map(([id, code]) => [code, TEMPERATURE_LABEL[id as Temperature]]),
  ...Object.entries(SIZE).map(([id, code]) => [code, SIZE_LABEL[id as CupSize]]),
  ...Object.entries(BURGER).map(([id, code]) => [code, getBurger(id as BurgerId).name]),
  ...Object.entries(SIDE).map(([id, code]) => [code, getSide(id as SideId).name]),
  ...Object.entries(DRINK).map(([id, code]) => [code, getSetDrink(id as SetDrinkId).name]),
  ...Object.entries(PAYMENT).map(([id, code]) => [code, PAYMENT_LABEL[id as PaymentMethod]]),
  ["MEAL_SET", "세트"],
  ["MEAL_SINGLE", "단품"],
]);

const quantityAction = (before: number, after: number): BackendAction => ({
  actionType: "QUANTITY",
  targetCode: after > before ? "QUANTITY_PLUS" : "QUANTITY_MINUS",
  actionData: { quantity: after },
});

/** 주문 상태를 바꾸는 동작. before는 바꾸기 전 상태다. 기록하지 않는 동작은 null */
export function actionForOrder(action: OrderAction, before: OrderState): BackendAction | null {
  switch (action.type) {
    case "setDineOption":
      return { actionType: "SELECT", targetCode: DINE[action.value] };
    case "selectMenu":
      return { actionType: "SELECT", targetCode: CAFE_MENU[action.menuId] };
    case "selectBurger":
      return { actionType: "SELECT", targetCode: BURGER[action.menuId] };
    case "chooseSet":
      return { actionType: "OPTION", targetCode: action.set ? "MEAL_SET" : "MEAL_SINGLE" };
    case "setSide":
      return { actionType: "OPTION", targetCode: SIDE[action.value] };
    case "setSetDrink":
      return { actionType: "OPTION", targetCode: DRINK[action.value] };
    case "setTemperature":
      return { actionType: "OPTION", targetCode: TEMPERATURE[action.value] };
    case "setSize":
      return { actionType: "OPTION", targetCode: SIZE[action.value] };
    case "setQuantity":
      return quantityAction(before.draft?.quantity ?? 1, action.value);
    case "setCartQuantity":
      return quantityAction(before.cart[action.index]?.quantity ?? 1, action.value);
    case "addDraftToCart":
      return { actionType: "NEXT", targetCode: "BUTTON_ADD_TO_CART" };
    case "selectPayment":
      return { actionType: "SELECT", targetCode: PAYMENT[action.value] };
    case "completePayment":
      return before.paymentMethod
        ? { actionType: "PAY", targetCode: PAYMENT[before.paymentMethod] }
        : null;
    /*
     * 백엔드 코드표에 삭제 행동이 없어서 보내지 않는다(모르는 코드는 틀린 행동으로 세진다).
     * 삭제한 결과는 주문하기(BUTTON_ORDER)의 장바구니 내용(items)으로 전해진다.
     */
    case "removeCartItem":
    case "clearCart":
    case "setPaidOption":
    case "setFreeOption":
    case "applyCoupon":
      return null;
  }
}

/** 화면 이동 버튼. 주문 상태는 그대로이고 화면만 바뀌는 버튼을 행동으로 기록한다 */
export function actionForMove(
  service: PracticeService,
  from: RealScreen,
  to: RealScreen,
  order: Pick<OrderState, "cart">,
): BackendAction | null {
  if (from === "menu" && (to === "cart" || to === "orderReview")) {
    return { actionType: "NEXT", targetCode: "BUTTON_GO_CART" };
  }
  if (
    (from === "cart" && to === "membership") ||
    (from === "orderReview" && to === "paymentMethod")
  ) {
    return {
      actionType: "NEXT",
      targetCode: "BUTTON_ORDER",
      actionData: { items: cartItems(service, order.cart) },
    };
  }
  if (from === "membership" && to === "paymentMethod") {
    return { actionType: "NEXT", targetCode: "BUTTON_SKIP" };
  }
  if (from === "setCompose" && to === "burgerConfirm") {
    return { actionType: "NEXT", targetCode: "BUTTON_NEXT" };
  }
  if (from === "done" && to === "result") {
    return { actionType: "NEXT", targetCode: "BUTTON_DONE" };
  }
  return null;
}

/**
 * 장바구니 내용 (NEXT BUTTON_ORDER의 action_data.items).
 * 백엔드는 이 값으로 결과 화면의 '미션과 다른 점'을 계산한다.
 * 키는 camelCase로 두고, 보낼 때 snake_case(meal_type)로 바뀐다.
 */
export function cartItems(service: PracticeService, cart: readonly CartItem[]) {
  return cart.map((item) =>
    item.type === "drink"
      ? {
          menu: CAFE_MENU[item.menuId],
          temperature: TEMPERATURE[item.temperature],
          size: SIZE[item.size],
          quantity: item.quantity,
        }
      : {
          menu: BURGER[item.menuId],
          mealType: item.set ? "MEAL_SET" : "MEAL_SINGLE",
          side: item.side ? SIDE[item.side] : null,
          drink: item.drink ? DRINK[item.drink] : null,
          quantity: item.quantity,
        },
  );
}
