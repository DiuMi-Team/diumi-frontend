import { describe, expect, it } from "vitest";
import {
  cartCount,
  cartTotal,
  EMPTY_ORDER,
  formatWon,
  itemOptionLabel,
  orderReducer,
  paidOptionsSummary,
  payableTotal,
  couponDiscount,
  type OrderAction,
} from "@/features/order/order";

function run(actions: OrderAction[]) {
  return actions.reduce(orderReducer, EMPTY_ORDER);
}

describe("주문 상태", () => {
  it("메뉴를 고르면 온도는 비어 있고 Regular · 1잔으로 시작한다", () => {
    const state = run([{ type: "selectMenu", menuId: "americano" }]);
    expect(state.draft).toEqual({
      menuId: "americano",
      temperature: null,
      size: "regular",
      quantity: 1,
      paidOptions: {},
    });
    expect(state.cart).toEqual([]);
  });

  it("선택 완료를 누르면 고르던 메뉴가 장바구니로 간다", () => {
    const state = run([
      { type: "selectMenu", menuId: "americano" },
      { type: "setTemperature", value: "ice" },
      { type: "addDraftToCart" },
    ]);
    expect(state.draft).toBeNull();
    expect(state.cart).toHaveLength(1);
    expect(itemOptionLabel(state.cart[0])).toBe("ICE · Regular");
  });

  it("Large는 500원, 수량은 곱해서 계산한다", () => {
    const state = run([
      { type: "selectMenu", menuId: "americano" },
      { type: "setSize", value: "large" },
      { type: "setQuantity", value: 2 },
      { type: "setTemperature", value: "hot" },
      { type: "addDraftToCart" },
      { type: "selectMenu", menuId: "mocha" },
      { type: "setTemperature", value: "ice" },
      { type: "addDraftToCart" },
    ]);
    expect(cartTotal(state.cart)).toBe((3200 + 500) * 2 + 4800);
    expect(cartCount(state.cart)).toBe(3);
  });

  it("이전 상태를 바꾸지 않는다", () => {
    const before = run([{ type: "selectMenu", menuId: "latte" }]);
    const snapshot = structuredClone(before);
    orderReducer(before, { type: "setTemperature", value: "ice" });
    expect(before).toEqual(snapshot);
  });

  it("고르던 메뉴 없이 옵션을 바꾸거나 담으면 오류를 낸다", () => {
    expect(() => run([{ type: "setTemperature", value: "ice" }])).toThrow();
    expect(() => run([{ type: "addDraftToCart" }])).toThrow();
  });

  it("온도를 고르지 않으면 담을 수 없다", () => {
    expect(() =>
      run([{ type: "selectMenu", menuId: "americano" }, { type: "addDraftToCart" }]),
    ).toThrow("온도");
  });

  it("수량은 1 이상의 정수만 받는다", () => {
    const start: OrderAction = { type: "selectMenu", menuId: "americano" };
    expect(() => run([start, { type: "setQuantity", value: 0 }])).toThrow();
    expect(() => run([start, { type: "setQuantity", value: 1.5 }])).toThrow();
  });

  it("결제 방법 없이 결제를 끝낼 수 없다", () => {
    expect(() => run([{ type: "completePayment" }])).toThrow();
    const paid = run([{ type: "selectPayment", value: "card" }, { type: "completePayment" }]);
    expect(paid.paid).toBe(true);
  });

  it("유료 옵션은 잔마다 붙고, 0개로 바꾸면 빠진다", () => {
    const start: OrderAction[] = [
      { type: "selectMenu", menuId: "mocha" },
      { type: "setTemperature", value: "hot" },
      { type: "setPaidOption", option: "whip", count: 1 },
    ];
    expect(run(start).draft?.paidOptions).toEqual({ whip: 1 });

    const two = run([...start, { type: "setQuantity", value: 2 }, { type: "addDraftToCart" }]);
    expect(cartTotal(two.cart)).toBe((4800 + 500) * 2);

    const removed = run([...start, { type: "setPaidOption", option: "whip", count: 0 }]);
    expect(removed.draft?.paidOptions).toEqual({});
  });

  it("유료 옵션은 0 이상의 정수만 받는다", () => {
    const start: OrderAction = { type: "selectMenu", menuId: "mocha" };
    expect(() => run([start, { type: "setPaidOption", option: "shot", count: -1 }])).toThrow();
  });

  it("옵션 이름은 화면에 맞게 길게 또는 짧게 보여 준다", () => {
    const [item] = run([
      { type: "selectMenu", menuId: "mocha" },
      { type: "setTemperature", value: "hot" },
      { type: "setPaidOption", option: "whip", count: 1 },
      { type: "setPaidOption", option: "shot", count: 2 },
      { type: "addDraftToCart" },
    ]).cart;
    expect(itemOptionLabel(item)).toBe("HOT · Regular · 샷 추가 2 · 휘핑크림");
    expect(itemOptionLabel(item, { short: true })).toBe("HOT · Regular · 샷 2 · 휘핑");
    expect(paidOptionsSummary(item.paidOptions)).toBe("샷 추가 2, 휘핑크림 1");
  });

  it("쿠폰을 쓰면 결제할 금액에서 할인된다", () => {
    const state = run([
      { type: "selectMenu", menuId: "latte" },
      { type: "setTemperature", value: "hot" },
      { type: "addDraftToCart" },
      { type: "applyCoupon", couponId: "drink1000" },
    ]);
    expect(cartTotal(state.cart)).toBe(4200);
    expect(couponDiscount(state)).toBe(1000);
    expect(payableTotal(state)).toBe(3200);
  });

  it("쿠폰 할인은 주문 금액보다 크지 않고, 빈 장바구니에는 쓸 수 없다", () => {
    expect(() => run([{ type: "applyCoupon", couponId: "drink1000" }])).toThrow();
    const cheap = {
      ...EMPTY_ORDER,
      cart: [
        {
          menuId: "americano" as const,
          temperature: "hot" as const,
          size: "regular" as const,
          quantity: 1,
          paidOptions: {},
        },
      ],
      couponId: "drink1000" as const,
    };
    expect(payableTotal({ ...cheap, cart: cheap.cart })).toBe(2200);
    expect(couponDiscount({ cart: [], couponId: "drink1000" })).toBe(0);
  });

  it("금액은 천 단위 쉼표와 원을 붙인다", () => {
    expect(formatWon(3200)).toBe("3,200원");
    expect(formatWon(12700)).toBe("12,700원");
    expect(formatWon(0)).toBe("0원");
  });
});
