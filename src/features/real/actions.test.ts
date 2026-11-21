import { describe, expect, it } from "vitest";
import {
  EMPTY_ORDER,
  orderReducer,
  type OrderAction,
  type OrderState,
} from "@/features/order/order";
import { actionForMove, actionForOrder, cartItems } from "@/features/real/actions";

const play = (actions: OrderAction[], start: OrderState = { ...EMPTY_ORDER, sizeMenu: "real" }) =>
  actions.reduce(orderReducer, start);

describe("주문 동작 → 백엔드 행동", () => {
  it("카페 미션 동작을 노션 코드표대로 바꾼다", () => {
    const order = play([]);
    expect(actionForOrder({ type: "setDineOption", value: "takeout" }, order)).toEqual({
      actionType: "SELECT",
      targetCode: "ORDER_TAKE_OUT",
    });
    expect(actionForOrder({ type: "selectMenu", menuId: "americano" }, order)).toEqual({
      actionType: "SELECT",
      targetCode: "MENU_AMERICANO",
    });
    expect(actionForOrder({ type: "selectMenu", menuId: "latte" }, order)?.targetCode).toBe(
      "MENU_CAFE_LATTE",
    );
    expect(actionForOrder({ type: "setTemperature", value: "ice" }, order)).toEqual({
      actionType: "OPTION",
      targetCode: "TEMP_ICE",
    });
    expect(actionForOrder({ type: "setSize", value: "large" }, order)?.targetCode).toBe(
      "SIZE_LARGE",
    );
    expect(actionForOrder({ type: "addDraftToCart" }, order)).toEqual({
      actionType: "NEXT",
      targetCode: "BUTTON_ADD_TO_CART",
    });
  });

  it("수량은 늘었는지 줄었는지와 바뀐 뒤 수량을 보낸다", () => {
    const drafting = play([{ type: "selectMenu", menuId: "americano" }]);
    expect(actionForOrder({ type: "setQuantity", value: 2 }, drafting)).toEqual({
      actionType: "QUANTITY",
      targetCode: "QUANTITY_PLUS",
      actionData: { quantity: 2 },
    });
    const inCart = play([
      { type: "selectMenu", menuId: "americano" },
      { type: "setTemperature", value: "ice" },
      { type: "setQuantity", value: 3 },
      { type: "addDraftToCart" },
    ]);
    expect(actionForOrder({ type: "setCartQuantity", index: 0, value: 2 }, inCart)).toEqual({
      actionType: "QUANTITY",
      targetCode: "QUANTITY_MINUS",
      actionData: { quantity: 2 },
    });
  });

  it("패스트푸드 구성·사이드·음료와 결제를 바꾼다", () => {
    const order = play([]);
    expect(actionForOrder({ type: "selectBurger", menuId: "bulgogi" }, order)?.targetCode).toBe(
      "MENU_BULGOGI_BURGER",
    );
    expect(actionForOrder({ type: "chooseSet", set: true }, order)?.targetCode).toBe("MEAL_SET");
    expect(actionForOrder({ type: "chooseSet", set: false }, order)?.targetCode).toBe(
      "MEAL_SINGLE",
    );
    expect(actionForOrder({ type: "setSide", value: "fries" }, order)?.targetCode).toBe(
      "SIDE_FRIES",
    );
    expect(actionForOrder({ type: "setSetDrink", value: "zero" }, order)?.targetCode).toBe(
      "DRINK_ZERO_COLA",
    );
    expect(actionForOrder({ type: "selectPayment", value: "card" }, order)).toEqual({
      actionType: "SELECT",
      targetCode: "PAY_CARD",
    });
    const chosen = play([{ type: "selectPayment", value: "mobilePay" }]);
    expect(actionForOrder({ type: "completePayment" }, chosen)).toEqual({
      actionType: "PAY",
      targetCode: "PAY_MOBILE",
    });
  });

  it("유료·무료 옵션과 쿠폰은 코드표에 없어 보내지 않는다", () => {
    const order = play([]);
    expect(actionForOrder({ type: "setPaidOption", option: "shot", count: 1 }, order)).toBeNull();
    expect(
      actionForOrder({ type: "setFreeOption", key: "ice", value: "less" } as OrderAction, order),
    ).toBeNull();
  });
});

describe("화면 이동 버튼 → 백엔드 행동", () => {
  const cafeCart = play([
    { type: "selectMenu", menuId: "americano" },
    { type: "setTemperature", value: "ice" },
    { type: "setSize", value: "large" },
    { type: "setQuantity", value: 2 },
    { type: "addDraftToCart" },
  ]);

  it("카페: 메뉴 더 담기 → 장바구니 → 멤버십 → 결제 방식, 결제 완료 확인", () => {
    expect(actionForMove("cafe", "menu", "cart", cafeCart)?.targetCode).toBe("BUTTON_GO_CART");
    expect(actionForMove("cafe", "cart", "membership", cafeCart)).toEqual({
      actionType: "NEXT",
      targetCode: "BUTTON_ORDER",
      actionData: {
        items: [
          { menu: "MENU_AMERICANO", temperature: "TEMP_ICE", size: "SIZE_LARGE", quantity: 2 },
        ],
      },
    });
    expect(actionForMove("cafe", "membership", "paymentMethod", cafeCart)?.targetCode).toBe(
      "BUTTON_SKIP",
    );
    expect(actionForMove("cafe", "done", "result", cafeCart)?.targetCode).toBe("BUTTON_DONE");
  });

  it("패스트푸드: 사이드·음료 다음, 메뉴 더 고르기 → 주문 확인 → 결제 방법", () => {
    const burgerCart = play([
      { type: "selectBurger", menuId: "bulgogi" },
      { type: "chooseSet", set: true },
      { type: "setSide", value: "fries" },
      { type: "setSetDrink", value: "cola" },
      { type: "addDraftToCart" },
    ]);
    expect(actionForMove("fastfood", "setCompose", "burgerConfirm", burgerCart)?.targetCode).toBe(
      "BUTTON_NEXT",
    );
    expect(actionForMove("fastfood", "menu", "orderReview", burgerCart)?.targetCode).toBe(
      "BUTTON_GO_CART",
    );
    expect(
      actionForMove("fastfood", "orderReview", "paymentMethod", burgerCart)?.actionData,
    ).toEqual({
      items: [
        {
          menu: "MENU_BULGOGI_BURGER",
          mealType: "MEAL_SET",
          side: "SIDE_FRIES",
          drink: "DRINK_COLA",
          quantity: 1,
        },
      ],
    });
  });

  it("주문 상태를 바꾸는 이동(메뉴 → 옵션 등)과 장바구니에서 메뉴 더 담기는 따로 보내지 않는다", () => {
    expect(actionForMove("cafe", "menu", "options", cafeCart)).toBeNull();
    expect(actionForMove("cafe", "cart", "menu", cafeCart)).toBeNull();
    expect(actionForMove("cafe", "options", "freeOptions", cafeCart)).toBeNull();
  });

  it("단품은 사이드·음료 없이 보낸다", () => {
    const single = play([
      { type: "selectBurger", menuId: "cheese" },
      { type: "chooseSet", set: false },
      { type: "addDraftToCart" },
    ]);
    expect(cartItems("fastfood", single.cart)).toEqual([
      { menu: "MENU_CHEESE_BURGER", mealType: "MEAL_SINGLE", side: null, drink: null, quantity: 1 },
    ]);
  });
});
