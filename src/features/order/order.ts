import {
  getCafeMenu,
  getCoupon,
  getPaidOption,
  LARGE_EXTRA_PRICE,
  PAID_OPTIONS,
  SIZE_LABEL,
  TEMPERATURE_LABEL,
  type CafeMenuId,
  type Coupon,
  type CouponId,
  type CupSize,
  type PaidOptionId,
  type Temperature,
} from "@/features/cafe/catalog";

/** 키오스크 주문 상태. 연습 엔진은 단계마다 이 상태에 동작을 하나씩 적용한다. */

export type DineOption = "dineIn" | "takeout";
export type PaymentMethod = "mobilePay" | "card" | "giftCard";

/** 유료 옵션별 개수. 고른 옵션만 들어 있다 */
export type PaidOptionCounts = Partial<Record<PaidOptionId, number>>;

export type CartItem = {
  menuId: CafeMenuId;
  temperature: Temperature;
  size: CupSize;
  quantity: number;
  paidOptions: PaidOptionCounts;
};

/** 옵션 화면에서 고르는 중인 메뉴. 온도는 손님이 직접 골라야 해서 처음에는 비어 있다 */
export type DraftItem = Omit<CartItem, "temperature"> & { temperature: Temperature | null };

export type OrderState = {
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
  | { type: "setTemperature"; value: Temperature }
  | { type: "setSize"; value: CupSize }
  | { type: "setQuantity"; value: number }
  | { type: "setPaidOption"; option: PaidOptionId; count: number }
  | { type: "addDraftToCart" }
  | { type: "applyCoupon"; couponId: CouponId }
  | { type: "selectPayment"; value: PaymentMethod }
  | { type: "completePayment" };

export const EMPTY_ORDER: OrderState = {
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
          menuId: action.menuId,
          temperature: null,
          size: "regular",
          quantity: 1,
          paidOptions: {},
        },
      };
    case "setTemperature":
      return { ...state, draft: updateDraft(state, { temperature: action.value }) };
    case "setSize":
      return { ...state, draft: updateDraft(state, { size: action.value }) };
    case "setQuantity":
      assertCount(action.value, 1, "수량");
      return { ...state, draft: updateDraft(state, { quantity: action.value }) };
    case "setPaidOption": {
      assertCount(action.count, 0, "유료 옵션 개수");
      const paidOptions = { ...requireDraft(state).paidOptions, [action.option]: action.count };
      if (action.count === 0) delete paidOptions[action.option];
      return { ...state, draft: updateDraft(state, { paidOptions }) };
    }
    case "addDraftToCart": {
      const draft = requireDraft(state);
      if (!draft.temperature) throw new Error("온도를 먼저 골라야 해요");
      return {
        ...state,
        cart: [...state.cart, { ...draft, temperature: draft.temperature }],
        draft: null,
      };
    }
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

function updateDraft(state: OrderState, patch: Partial<DraftItem>): DraftItem {
  return { ...requireDraft(state), ...patch };
}

/** 가격에는 온도가 상관없어서 고르는 중인 메뉴에도 쓸 수 있다 */
type PricedItem = Pick<CartItem, "menuId" | "size" | "quantity" | "paidOptions">;

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

export function itemUnitPrice(item: PricedItem): number {
  return (
    getCafeMenu(item.menuId).price +
    (item.size === "large" ? LARGE_EXTRA_PRICE : 0) +
    paidOptionsPrice(item.paidOptions)
  );
}

export function itemPrice(item: PricedItem): number {
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

/**
 * "HOT · Regular · 휘핑크림". 장바구니 요약처럼 좁은 곳은 short로 "휘핑".
 * 옵션을 2개 이상 고르면 "휘핑크림 2"처럼 개수를 붙인다.
 */
export function itemOptionLabel(item: CartItem, { short = false } = {}): string {
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
