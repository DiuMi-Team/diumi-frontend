import {
  getCafeMenu,
  getFreeOptionChoice,
  getPaidOption,
  getSizeOption,
  PAID_OPTIONS,
  SIZE_MENUS,
  SIZE_LABEL,
  TEMPERATURE_LABEL,
  type CafeMenuId,
  type CupSize,
  type FreeOptionKey,
  type SizeMenuId,
  type PaidOptionId,
  type Temperature,
} from "@/features/cafe/catalog";
import { getCoupon, type Coupon, type CouponId } from "@/features/order/coupons";
import {
  getBurger,
  getSetDrink,
  getSide,
  SINGLE_CONTENTS,
  type BurgerId,
  type SetDrinkId,
  type SideId,
} from "@/features/fastfood/catalog";

/** 키오스크 주문 상태. 연습 엔진은 단계마다 이 상태에 동작을 하나씩 적용한다. */

export type DineOption = "dineIn" | "takeout";
export type PaymentMethod = "mobilePay" | "card" | "giftCard";

/** 유료 옵션별 개수. 고른 옵션만 들어 있다 */
export type PaidOptionCounts = Partial<Record<PaidOptionId, number>>;
/** 무료 옵션. 고른 것만 들어 있고, 없으면 기본값이다 */
export type FreeOptionValues = Partial<Record<FreeOptionKey, string>>;

/** 카페 음료 */
export type DrinkItem = {
  type: "drink";
  menuId: CafeMenuId;
  temperature: Temperature;
  size: CupSize;
  /** 고른 사이즈의 추가 금액. 키오스크마다 달라서 고를 때 함께 기록한다 */
  sizeExtra: number;
  quantity: number;
  paidOptions: PaidOptionCounts;
  freeOptions: FreeOptionValues;
};

/** 패스트푸드 버거. 세트면 사이드와 음료가 함께 나오고, 단품이면 둘 다 null이다 */
export type BurgerItem = {
  type: "burger";
  menuId: BurgerId;
  set: boolean;
  side: SideId | null;
  drink: SetDrinkId | null;
  quantity: number;
};

export type CartItem = DrinkItem | BurgerItem;

/** 고르는 중인 음료. 온도는 손님이 직접 골라야 해서 처음에는 비어 있다 */
export type DrinkDraft = Omit<DrinkItem, "temperature"> & { temperature: Temperature | null };
/** 고르는 중인 버거. 세트/단품은 손님이 직접 골라야 해서 처음에는 비어 있다 */
export type BurgerDraft = Omit<BurgerItem, "set"> & { set: boolean | null };

export type DraftItem = DrinkDraft | BurgerDraft;

export type OrderState = {
  /** 이 키오스크의 사이즈 메뉴 (연습: Regular·Large, 실전: Large·Extra) */
  sizeMenu: SizeMenuId;
  dineOption: DineOption | null;
  cart: CartItem[];
  /** 선택 완료를 누르면 장바구니로 간다 */
  draft: DraftItem | null;
  /** 쓴 할인 쿠폰. 한 주문에 하나만 쓸 수 있다 */
  couponId: CouponId | null;
  paymentMethod: PaymentMethod | null;
  paid: boolean;
};

export type OrderAction =
  | { type: "setDineOption"; value: DineOption }
  | { type: "selectMenu"; menuId: CafeMenuId }
  | { type: "selectBurger"; menuId: BurgerId }
  | { type: "chooseSet"; set: boolean }
  | { type: "setSide"; value: SideId }
  | { type: "setSetDrink"; value: SetDrinkId }
  | { type: "setTemperature"; value: Temperature }
  | { type: "setSize"; value: CupSize }
  | { type: "setQuantity"; value: number }
  | { type: "setPaidOption"; option: PaidOptionId; count: number }
  | { type: "setFreeOption"; key: FreeOptionKey; value: string }
  | { type: "setCartQuantity"; index: number; value: number }
  | { type: "removeCartItem"; index: number }
  | { type: "clearCart" }
  | { type: "addDraftToCart" }
  | { type: "applyCoupon"; couponId: CouponId }
  | { type: "selectPayment"; value: PaymentMethod }
  | { type: "completePayment" };

export const EMPTY_ORDER: OrderState = {
  sizeMenu: "practice",
  dineOption: null,
  cart: [],
  draft: null,
  couponId: null,
  paymentMethod: null,
  paid: false,
};

export function orderReducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case "setDineOption":
      return { ...state, dineOption: action.value };
    case "selectMenu":
      return {
        ...state,
        draft: {
          type: "drink",
          menuId: action.menuId,
          temperature: null,
          size: SIZE_MENUS[state.sizeMenu][0].id,
          sizeExtra: 0,
          quantity: 1,
          paidOptions: {},
          freeOptions: {},
        },
      };
    case "selectBurger":
      return {
        ...state,
        draft: {
          type: "burger",
          menuId: action.menuId,
          set: null,
          side: null,
          drink: null,
          quantity: 1,
        },
      };
    case "chooseSet":
      return {
        ...state,
        draft: {
          ...requireBurgerDraft(state),
          set: action.set,
          /* 세트의 사이드·음료는 손님이 직접 고른다. "기본"은 추가 금액이 없다는 표시일 뿐이다 */
          side: null,
          drink: null,
        },
      };
    case "setSide":
      return { ...state, draft: { ...requireSetDraft(state), side: action.value } };
    case "setSetDrink":
      return { ...state, draft: { ...requireSetDraft(state), drink: action.value } };
    case "setTemperature":
      return { ...state, draft: { ...requireDrinkDraft(state), temperature: action.value } };
    case "setSize":
      return {
        ...state,
        draft: {
          ...requireDrinkDraft(state),
          size: action.value,
          sizeExtra: getSizeOption(state.sizeMenu, action.value).extra,
        },
      };
    case "setQuantity":
      assertCount(action.value, 1, "수량");
      return { ...state, draft: { ...requireDraft(state), quantity: action.value } };
    case "setPaidOption": {
      assertCount(action.count, 0, "유료 옵션 개수");
      const draft = requireDrinkDraft(state);
      const paidOptions = { ...draft.paidOptions, [action.option]: action.count };
      if (action.count === 0) delete paidOptions[action.option];
      return { ...state, draft: { ...draft, paidOptions } };
    }
    case "setFreeOption": {
      getFreeOptionChoice(action.key, action.value);
      const draft = requireDrinkDraft(state);
      return {
        ...state,
        draft: { ...draft, freeOptions: { ...draft.freeOptions, [action.key]: action.value } },
      };
    }
    case "setCartQuantity": {
      assertCount(action.value, 1, "수량");
      if (!state.cart[action.index]) throw new Error(`장바구니에 없는 항목이에요: ${action.index}`);
      return {
        ...state,
        cart: state.cart.map((item, index) =>
          index === action.index ? { ...item, quantity: action.value } : item,
        ),
      };
    }
    case "removeCartItem": {
      if (!state.cart[action.index]) throw new Error(`장바구니에 없는 항목이에요: ${action.index}`);
      const cart = state.cart.filter((_, index) => index !== action.index);
      /* 쿠폰은 담은 메뉴가 있어야 쓸 수 있어서, 다 빠지면 함께 뺀다 */
      return { ...state, cart, couponId: cart.length > 0 ? state.couponId : null };
    }
    case "clearCart":
      return { ...state, cart: [], couponId: null };
    case "addDraftToCart":
      return { ...state, cart: [...state.cart, completeDraft(requireDraft(state))], draft: null };
    case "applyCoupon":
      if (state.cart.length === 0) throw new Error("쿠폰은 메뉴를 담은 뒤에 쓸 수 있어요");
      getCoupon(action.couponId);
      return { ...state, couponId: action.couponId };
    case "selectPayment":
      return { ...state, paymentMethod: action.value };
    case "completePayment":
      if (!state.paymentMethod) throw new Error("결제 방법을 먼저 골라야 해요");
      return { ...state, paid: true };
  }
}

function assertCount(value: number, min: number, name: string) {
  if (!Number.isInteger(value) || value < min) {
    throw new Error(`${name}는 ${min} 이상의 정수여야 해요: ${value}`);
  }
}

function requireDraft(state: OrderState): DraftItem {
  if (!state.draft) throw new Error("옵션을 바꿀 메뉴를 먼저 골라야 해요");
  return state.draft;
}

function requireDrinkDraft(state: OrderState): DrinkDraft {
  const draft = requireDraft(state);
  if (draft.type !== "drink") throw new Error("음료 옵션은 음료를 고른 뒤에 바꿀 수 있어요");
  return draft;
}

function requireBurgerDraft(state: OrderState): BurgerDraft {
  const draft = requireDraft(state);
  if (draft.type !== "burger") throw new Error("세트/단품은 버거를 고른 뒤에 고를 수 있어요");
  return draft;
}

function requireSetDraft(state: OrderState): BurgerDraft {
  const draft = requireBurgerDraft(state);
  if (!draft.set) throw new Error("사이드와 음료는 세트를 고른 뒤에 바꿀 수 있어요");
  return draft;
}

/** 장바구니에 담을 수 있게 다 골랐는지 확인한다 */
function completeDraft(draft: DraftItem): CartItem {
  if (draft.type === "drink") {
    if (!draft.temperature) throw new Error("온도를 먼저 골라야 해요");
    return { ...draft, temperature: draft.temperature };
  }
  if (draft.set === null) throw new Error("세트/단품을 먼저 골라야 해요");
  if (draft.set && (!draft.side || !draft.drink)) {
    throw new Error("세트의 사이드와 음료를 먼저 골라야 해요");
  }
  return { ...draft, set: draft.set };
}

/** 고른 유료 옵션을 메뉴판 순서대로 [옵션, 개수]로 돌려준다 */
export function selectedPaidOptions(counts: PaidOptionCounts) {
  return PAID_OPTIONS.filter((option) => (counts[option.id] ?? 0) > 0).map(
    (option) => [option, counts[option.id]!] as const,
  );
}

/** 한 잔에 붙는 유료 옵션 금액 */
export function paidOptionsPrice(counts: PaidOptionCounts): number {
  return selectedPaidOptions(counts).reduce(
    (sum, [option, count]) => sum + getPaidOption(option.id).price * count,
    0,
  );
}

/** 한 개(한 잔) 가격. 고르는 중인 메뉴에도 쓸 수 있다 */
export function itemUnitPrice(item: CartItem | DraftItem): number {
  if (item.type === "burger") {
    const burger = getBurger(item.menuId);
    if (!item.set) return burger.price;
    return (
      burger.setPrice +
      (item.side ? getSide(item.side).extra : 0) +
      (item.drink ? getSetDrink(item.drink).extra : 0)
    );
  }
  return getCafeMenu(item.menuId).price + item.sizeExtra + paidOptionsPrice(item.paidOptions);
}

export function itemPrice(item: CartItem | DraftItem): number {
  return itemUnitPrice(item) * item.quantity;
}

export function cartTotal(cart: readonly CartItem[]): number {
  return cart.reduce((sum, item) => sum + itemPrice(item), 0);
}

export function appliedCoupon(state: Pick<OrderState, "couponId">): Coupon | null {
  return state.couponId ? getCoupon(state.couponId) : null;
}

/** 쿠폰 할인. 주문 금액보다 클 수 없다 */
export function couponDiscount(state: Pick<OrderState, "cart" | "couponId">): number {
  const coupon = appliedCoupon(state);
  return coupon ? Math.min(coupon.discount, cartTotal(state.cart)) : 0;
}

/** 실제로 결제할 금액 = 주문 금액 − 쿠폰 할인 */
export function payableTotal(state: Pick<OrderState, "cart" | "couponId">): number {
  return cartTotal(state.cart) - couponDiscount(state);
}

export function cartCount(cart: readonly CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/** "아메리카노", "불고기버거 단품" */
export function itemName(item: CartItem | DraftItem): string {
  if (item.type === "drink") return getCafeMenu(item.menuId).name;
  const name = getBurger(item.menuId).name;
  return item.set === null ? name : `${name} ${item.set ? "세트" : "단품"}`;
}

/** 수량 단위. 음료는 잔, 버거는 개 */
export function itemUnit(item: CartItem | DraftItem): string {
  return item.type === "drink" ? "잔" : "개";
}

/**
 * 음료는 "HOT · Regular · 휘핑크림", 버거는 "버거만" 또는 "버거 + 감자튀김 + 콜라".
 * 장바구니 요약처럼 좁은 곳은 short로 "휘핑". 옵션을 2개 이상 고르면 "휘핑크림 2"처럼 개수를 붙인다.
 */
export function itemDetail(item: CartItem, { short = false } = {}): string {
  if (item.type === "burger") return setContents(item) ?? SINGLE_CONTENTS;
  const extras = selectedPaidOptions(item.paidOptions).map(([option, count]) => {
    const name = short ? option.shortName : option.name;
    return count > 1 ? `${name} ${count}` : name;
  });
  return [TEMPERATURE_LABEL[item.temperature], SIZE_LABEL[item.size], ...extras].join(" · ");
}

/** 옵션 화면의 유료 옵션 줄에 쓰는 "휘핑크림 1" */
export function paidOptionsSummary(counts: PaidOptionCounts): string {
  return selectedPaidOptions(counts)
    .map(([option, count]) => `${option.name} ${count}`)
    .join(", ");
}

/** 3200 → "3,200원" */
export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}

/** 세트 구성 "감자튀김 · 제로콜라". 단품이면 null */
export function setContents(
  item: Pick<BurgerItem, "set" | "side" | "drink">,
  separator = " · ",
): string | null {
  if (!item.set || !item.side || !item.drink) return null;
  return [getSide(item.side).name, getSetDrink(item.drink).name].join(separator);
}

/** 고른 무료 옵션 중 기본값이 아닌 것의 짧은 설명. 예: ["얼음 적게", "빨대 없음"] */
export function freeOptionSummaries(values: FreeOptionValues): string[] {
  return (Object.entries(values) as [FreeOptionKey, string][])
    .map(([key, id]) => getFreeOptionChoice(key, id).summary)
    .filter((summary): summary is string => Boolean(summary));
}
