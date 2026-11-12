import {
  getCafeMenu,
  LARGE_EXTRA_PRICE,
  SIZE_LABEL,
  TEMPERATURE_LABEL,
  type CafeMenuId,
  type CupSize,
  type Temperature,
} from "@/features/cafe/catalog";

/** 키오스크 주문 상태. 연습 엔진은 단계마다 이 상태에 동작을 하나씩 적용한다. */

export type DineOption = "dineIn" | "takeout";
export type PaymentMethod = "mobilePay" | "card" | "giftCard";

export type CartItem = {
  menuId: CafeMenuId;
  temperature: Temperature;
  size: CupSize;
  quantity: number;
};

/** 옵션 화면에서 고르는 중인 메뉴. 온도는 손님이 직접 골라야 해서 처음에는 비어 있다 */
export type DraftItem = Omit<CartItem, "temperature"> & { temperature: Temperature | null };

export type OrderState = {
  dineOption: DineOption | null;
  cart: CartItem[];
  /** 선택 완료를 누르면 장바구니로 간다 */
  draft: DraftItem | null;
  paymentMethod: PaymentMethod | null;
  paid: boolean;
};

export type OrderAction =
  | { type: "setDineOption"; value: DineOption }
  | { type: "selectMenu"; menuId: CafeMenuId }
  | { type: "setTemperature"; value: Temperature }
  | { type: "setSize"; value: CupSize }
  | { type: "setQuantity"; value: number }
  | { type: "addDraftToCart" }
  | { type: "selectPayment"; value: PaymentMethod }
  | { type: "completePayment" };

export const EMPTY_ORDER: OrderState = {
  dineOption: null,
  cart: [],
  draft: null,
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
        draft: { menuId: action.menuId, temperature: null, size: "regular", quantity: 1 },
      };
    case "setTemperature":
      return { ...state, draft: updateDraft(state, { temperature: action.value }) };
    case "setSize":
      return { ...state, draft: updateDraft(state, { size: action.value }) };
    case "setQuantity":
      if (!Number.isInteger(action.value) || action.value < 1) {
        throw new Error(`수량은 1 이상의 정수여야 해요: ${action.value}`);
      }
      return { ...state, draft: updateDraft(state, { quantity: action.value }) };
    case "addDraftToCart": {
      const { draft } = state;
      if (!draft) throw new Error("담을 메뉴를 먼저 골라야 해요");
      if (!draft.temperature) throw new Error("온도를 먼저 골라야 해요");
      return {
        ...state,
        cart: [...state.cart, { ...draft, temperature: draft.temperature }],
        draft: null,
      };
    }
    case "selectPayment":
      return { ...state, paymentMethod: action.value };
    case "completePayment":
      if (!state.paymentMethod) throw new Error("결제 방법을 먼저 골라야 해요");
      return { ...state, paid: true };
  }
}

function updateDraft(state: OrderState, patch: Partial<DraftItem>): DraftItem {
  if (!state.draft) throw new Error("옵션을 바꿀 메뉴를 먼저 골라야 해요");
  return { ...state.draft, ...patch };
}

/** 가격에는 온도가 상관없어서 고르는 중인 메뉴에도 쓸 수 있다 */
type PricedItem = Pick<CartItem, "menuId" | "size" | "quantity">;

export function itemUnitPrice(item: PricedItem): number {
  return getCafeMenu(item.menuId).price + (item.size === "large" ? LARGE_EXTRA_PRICE : 0);
}

export function itemPrice(item: PricedItem): number {
  return itemUnitPrice(item) * item.quantity;
}

export function cartTotal(cart: readonly CartItem[]): number {
  return cart.reduce((sum, item) => sum + itemPrice(item), 0);
}

export function cartCount(cart: readonly CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/** "HOT · Regular" */
export function itemOptionLabel(item: CartItem): string {
  return `${TEMPERATURE_LABEL[item.temperature]} · ${SIZE_LABEL[item.size]}`;
}

/** 3200 → "3,200원" */
export function formatWon(amount: number): string {
  return `${amount.toLocaleString("ko-KR")}원`;
}
