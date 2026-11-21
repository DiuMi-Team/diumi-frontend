import { describe, expect, it } from "vitest";
import { EMPTY_ORDER, type CartItem, type OrderState } from "@/features/order/order";
import { screenCode } from "@/features/real/screen-codes";

const empty: Pick<OrderState, "cart" | "draft"> = { cart: [], draft: null };
const burger = (side: "fries" | null) => ({
  ...EMPTY_ORDER,
  draft: {
    type: "burger" as const,
    menuId: "bulgogi" as const,
    set: true,
    side,
    drink: null,
    quantity: 1,
  },
});

describe("AI 연결 화면 코드", () => {
  it("공통 화면은 백엔드 목록의 코드로 바꾼다", () => {
    expect(screenCode("cafe", "dine", empty)).toBe("SELECT_ORDER_TYPE");
    expect(screenCode("cafe", "menu", empty)).toBe("SELECT_MENU");
    expect(screenCode("cafe", "freeOptions", empty)).toBe("SELECT_OPTION");
    expect(screenCode("cafe", "cart", empty)).toBe("CART");
    expect(screenCode("cafe", "membership", empty)).toBe("MEMBERSHIP");
    expect(screenCode("cafe", "paymentMethod", empty)).toBe("SELECT_PAYMENT");
  });

  it("결제 진행은 결제 수단별 코드를 쓴다 (단계 코드 PAYMENT는 쓰지 않는다)", () => {
    expect(screenCode("cafe", "payCard", empty)).toBe("PAY_CARD");
    expect(screenCode("cafe", "payMobile", empty)).toBe("PAY_MOBILE");
    expect(screenCode("fastfood", "payGiftCard", empty)).toBe("PAY_BARCODE");
  });

  it("패스트푸드는 메뉴 더 고르기·사이드/음료·주문 확인을 나눈다", () => {
    const filled = { cart: [{} as CartItem], draft: null };
    expect(screenCode("fastfood", "menu", empty)).toBe("SELECT_MENU");
    expect(screenCode("fastfood", "menu", filled)).toBe("SELECT_EXTRA_MENU");
    expect(screenCode("cafe", "menu", filled)).toBe("SELECT_MENU"); // 카페 목록에는 없다
    expect(screenCode("fastfood", "setChoice", empty)).toBe("SELECT_MEAL_TYPE");
    expect(screenCode("fastfood", "setCompose", burger(null))).toBe("SELECT_SIDE");
    expect(screenCode("fastfood", "setCompose", burger("fries"))).toBe("SELECT_DRINK");
    expect(screenCode("fastfood", "burgerConfirm", empty)).toBe("SELECT_QUANTITY");
    expect(screenCode("fastfood", "orderReview", empty)).toBe("ORDER_REVIEW");
  });
});
