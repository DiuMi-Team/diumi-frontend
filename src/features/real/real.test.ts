import { describe, expect, it } from "vitest";
import { EMPTY_ORDER, orderReducer, type OrderAction } from "@/features/order/order";
import { realProgress } from "@/features/real/flow";
import { judgementFromServer, objectParticle, readableDetail } from "@/features/real/judge";
import {
  formatDuration,
  realDrinkDetail,
  realDrinkName,
  realOrderSummary,
} from "@/features/real/labels";
import { CAFE_REAL_MISSION } from "@/features/real/missions";

const REAL = { ...EMPTY_ORDER, sizeMenu: "real" as const };

function order(actions: OrderAction[]) {
  return actions.reduce(orderReducer, REAL);
}

describe("실전 진행 단계", () => {
  it("화면마다 9단계 중 어디인지 알려 준다", () => {
    expect(realProgress("dine", REAL)).toEqual({ step: 1, label: "이용 방법" });
    expect(realProgress("options", REAL).step).toBe(3);
    expect(realProgress("freeOptions", REAL).label).toBe("옵션 선택 · 무료 옵션");
    expect(realProgress("cart", REAL).step).toBe(5);
    expect(realProgress("membership", REAL).step).toBe(6);
  });

  it("메뉴 화면은 장바구니가 비면 2단계, 차 있으면 4단계다", () => {
    const filled = order([
      { type: "selectMenu", menuId: "americano" },
      { type: "setTemperature", value: "ice" },
      { type: "addDraftToCart" },
    ]);
    expect(realProgress("menu", REAL).step).toBe(2);
    expect(realProgress("menu", filled).step).toBe(4);
  });
});

describe("실전 음료 표기", () => {
  it("온도와 사이즈를 이름에 붙인다", () => {
    const [item] = order([
      { type: "selectMenu", menuId: "americano" },
      { type: "setTemperature", value: "ice" },
      { type: "addDraftToCart" },
    ]).cart;
    expect(item.type === "drink" && realDrinkName(item)).toBe("아이스 아메리카노 Large");
  });

  it("옵션이 없으면 기본 옵션, 있으면 고른 옵션과 이용 방법을 보여 준다", () => {
    const base = { paidOptions: {}, freeOptions: {} };
    expect(realDrinkDetail(base, "takeout")).toBe("기본 옵션 · 포장");
    expect(
      realDrinkDetail({ paidOptions: { whip: 1 }, freeOptions: { ice: "less" } }, "dineIn"),
    ).toBe("휘핑크림 · 얼음 적게 · 매장");
  });
});

describe("실전 카페 미션", () => {
  it("아이스 아메리카노 Large 2잔을 포장·카드로 주문하는 미션이다", () => {
    expect(CAFE_REAL_MISSION.expected).toEqual({
      item: { type: "drink", menuId: "americano", temperature: "ice", size: "large", quantity: 2 },
      dineOption: "takeout",
      paymentMethod: "card",
    });
    expect(CAFE_REAL_MISSION.conditions).toHaveLength(4);
  });
});

describe("결과 화면 문구", () => {
  const base: OrderAction[] = [
    { type: "setDineOption", value: "takeout" },
    { type: "selectMenu", menuId: "americano" },
    { type: "setTemperature", value: "ice" },
    { type: "setQuantity", value: 2 },
    { type: "addDraftToCart" },
    { type: "selectPayment", value: "card" },
    { type: "completePayment" },
  ];

  it("결과 화면 문구: 완료한 주문과 소요 시간", () => {
    expect(realOrderSummary(order(base))).toBe("아이스 아메리카노 Large 2잔 · 포장 · 카드 결제");
    expect(formatDuration(161_000)).toBe("2분 41초");
    expect(formatDuration(9_400)).toBe("9초");
  });
});

describe("서버 수행 결과 → 결과 화면 판정", () => {
  const base = {
    sessionId: "s",
    elapsedSeconds: 30,
    aiHelpCount: 0,
    errorCount: 0,
    backCount: 0,
  };

  it("조건별 결과와 비율을 쓰고, 틀린 조건은 고른 것과 미션을 함께 보여 준다", () => {
    const judgement = judgementFromServer({
      ...base,
      isSuccess: false,
      conditionPassRate: 75,
      conditions: [
        { code: "ORDER_TYPE", condition: "매장 식사 선택", passed: true, detail: null },
        {
          code: "SIDE_DRINK",
          condition: "감자튀김 · 콜라 선택",
          passed: false,
          detail: "샐러드 · 제로콜라를 골랐어요",
        },
      ],
    });
    expect(judgement).toEqual({
      success: false,
      percent: 75,
      conditions: [
        { label: "매장 식사 선택", ok: true, differences: [] },
        {
          label: "감자튀김 · 콜라 선택",
          ok: false,
          differences: ["샐러드 · 제로콜라를 골랐어요 (미션: 감자튀김 · 콜라 선택)"],
        },
      ],
    });
  });

  it("서버 문장에 코드가 그대로 오면 이름으로 바꾸고 조사도 맞춘다", () => {
    expect(readableDetail("SIDE_SALAD를 골랐어요")).toBe("샐러드를 골랐어요");
    expect(readableDetail("SIDE_NUGGETS를 골랐어요")).toBe("치킨너겟을 골랐어요");
    expect(readableDetail("SIDE_SALAD · DRINK_ORANGE를 골랐어요")).toBe(
      "샐러드 · 오렌지를 골랐어요",
    );
    expect(readableDetail("MENU_COLD_BREW를 골랐어요")).toBe("콜드브루를 골랐어요");
    expect(readableDetail("MENU_SPICY_BURGER를 골랐어요")).toBe("매운버거를 골랐어요");
    expect(readableDetail("SIZE_EXTRA를 골랐어요")).toBe("Extra를 골랐어요");
    // 이미 이름으로 온 문장과 모르는 코드는 그대로 둔다
    expect(readableDetail("따뜻하게(HOT)를 골랐어요")).toBe("따뜻하게(HOT)를 골랐어요");
    expect(readableDetail("NEW_CODE를 골랐어요")).toBe("NEW_CODE를 골랐어요");
  });

  it("비율이 없으면 맞힌 조건으로 계산하고, 조건이 없으면 null이다", () => {
    expect(
      judgementFromServer({
        ...base,
        isSuccess: true,
        conditions: [
          { code: "MENU", condition: "아이스 아메리카노 선택", passed: true, detail: null },
        ],
      }),
    ).toMatchObject({ success: true, percent: 100 });
    expect(judgementFromServer({ ...base, isSuccess: null })).toBeNull();
  });
});

describe("실전 패스트푸드", () => {
  const set: OrderAction[] = [
    { type: "setDineOption", value: "dineIn" },
    { type: "selectBurger", menuId: "bulgogi" },
    { type: "chooseSet", set: true },
    { type: "setSide", value: "fries" },
    { type: "setSetDrink", value: "cola" },
    { type: "addDraftToCart" },
    { type: "selectPayment", value: "card" },
    { type: "completePayment" },
  ];

  it("진행 단계: 구성 3, 사이드·음료 4, 담기 5, 메뉴 더 고르기 6, 주문 확인 7", () => {
    expect(realProgress("setChoice", REAL, "fastfood")).toEqual({ step: 3, label: "구성 선택" });
    expect(realProgress("setCompose", REAL, "fastfood").step).toBe(4);
    expect(realProgress("burgerConfirm", REAL, "fastfood").step).toBe(5);
    expect(realProgress("menu", REAL, "fastfood").step).toBe(2);
    expect(realProgress("menu", order(set), "fastfood").step).toBe(6);
    expect(realProgress("orderReview", REAL, "fastfood").step).toBe(7);
    expect(realProgress("paymentMethod", REAL, "fastfood")).toEqual({
      step: 8,
      label: "결제 방법",
    });
  });

  it("결과 화면 문구: 세트 구성과 이용 방법", () => {
    expect(realOrderSummary(order(set))).toBe(
      "불고기버거 세트 · 감자튀김 · 콜라 · 매장 · 카드 결제",
    );
  });

  it("목적격 조사는 받침에 맞춘다", () => {
    expect(objectParticle("단품")).toBe("을");
    expect(objectParticle("콜라")).toBe("를");
    expect(objectParticle("HOT")).toBe("을");
    expect(objectParticle("Large")).toBe("를");
  });
});
