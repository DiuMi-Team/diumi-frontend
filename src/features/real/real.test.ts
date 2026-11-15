import { describe, expect, it } from "vitest";
import { endSession, getMockSession, logEvents, startSession } from "@/features/api/session";
import { EMPTY_ORDER, orderReducer, type OrderAction } from "@/features/order/order";
import { realProgress } from "@/features/real/flow";
import { judgeMission } from "@/features/real/judge";
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
      cart: [{ menuId: "americano", temperature: "ice", size: "large", quantity: 2 }],
      dineOption: "takeout",
      paymentMethod: "card",
    });
    expect(CAFE_REAL_MISSION.conditions).toHaveLength(4);
  });
});

describe("체험 세션 mock API", () => {
  it("세션을 시작하고, 행동을 모아 기록하고, 결과와 함께 끝낸다", async () => {
    const { sessionId } = await startSession({ mode: "mission", service: "cafe", missionId: "m" });
    await logEvents(sessionId, [
      { type: "screen_view", screen: "dine", elapsedMs: 0 },
      { type: "tap", screen: "dine", target: "dine:takeout", elapsedMs: 1200 },
    ]);
    const result = await endSession(sessionId, { success: true, elapsedMs: 60000, helpCount: 1 });

    expect(result.success).toBe(true);
    expect(getMockSession(sessionId)).toMatchObject({
      mode: "mission",
      service: "cafe",
      events: [{ type: "screen_view" }, { type: "tap", target: "dine:takeout" }],
      summary: { helpCount: 1 },
    });
  });

  it("세션마다 다른 아이디를 준다", async () => {
    const first = await startSession({ mode: "free", service: "cafe" });
    const second = await startSession({ mode: "free", service: "cafe" });
    expect(first.sessionId).not.toBe(second.sessionId);
  });
});

describe("미션 판정", () => {
  const base: OrderAction[] = [
    { type: "setDineOption", value: "takeout" },
    { type: "selectMenu", menuId: "americano" },
    { type: "setTemperature", value: "ice" },
    { type: "setQuantity", value: 2 },
    { type: "addDraftToCart" },
    { type: "selectPayment", value: "card" },
    { type: "completePayment" },
  ];

  it("미션대로 주문하면 성공, 100%다", () => {
    const result = judgeMission(CAFE_REAL_MISSION, order(base));
    expect(result).toMatchObject({ success: true, percent: 100 });
    expect(result.conditions.every((condition) => condition.ok)).toBe(true);
  });

  it("사이즈만 다르면 75%이고 다른 점을 알려 준다", () => {
    const result = judgeMission(
      CAFE_REAL_MISSION,
      order([...base.slice(0, 3), { type: "setSize", value: "extra" }, ...base.slice(3)]),
    );
    expect(result).toMatchObject({ success: false, percent: 75 });
    expect(result.conditions[1]).toEqual({
      label: "Large 사이즈 · 수량 2잔",
      ok: false,
      differences: ["사이즈: Extra를 골랐어요 → 미션은 Large"],
    });
  });

  it("온도·수량·이용 방법·결제 방법이 다르면 각각 알려 준다", () => {
    const result = judgeMission(
      CAFE_REAL_MISSION,
      order([
        { type: "setDineOption", value: "dineIn" },
        { type: "selectMenu", menuId: "americano" },
        { type: "setTemperature", value: "hot" },
        { type: "addDraftToCart" },
        { type: "selectPayment", value: "mobilePay" },
        { type: "completePayment" },
      ]),
    );
    expect(result.percent).toBe(0);
    expect(result.conditions.flatMap((condition) => condition.differences)).toEqual([
      "온도: HOT을 골랐어요 → 미션은 ICE",
      "수량: 1잔 → 미션은 2잔",
      "이용 방법: 매장을 골랐어요 → 미션은 포장",
      "결제: 모바일페이로 결제했어요 → 미션은 신용·체크카드",
    ]);
  });

  it("미션에 없는 메뉴를 더 담으면 메뉴 조건이 틀린다", () => {
    const result = judgeMission(
      CAFE_REAL_MISSION,
      order([
        ...base.slice(0, 5),
        { type: "selectMenu", menuId: "latte" },
        { type: "setTemperature", value: "hot" },
        { type: "addDraftToCart" },
        ...base.slice(5),
      ]),
    );
    expect(result.conditions[0].ok).toBe(false);
    expect(result.conditions[0].differences).toEqual([
      "미션에 없는 메뉴도 담았어요: 따뜻한 카페라떼 Large 1잔",
    ]);
  });

  it("아메리카노를 담지 않으면 메뉴가 없다고 알려 준다", () => {
    const result = judgeMission(
      CAFE_REAL_MISSION,
      order([
        { type: "setDineOption", value: "takeout" },
        { type: "selectMenu", menuId: "mocha" },
        { type: "setTemperature", value: "ice" },
        { type: "addDraftToCart" },
      ]),
    );
    expect(result.conditions[0].differences[0]).toBe("메뉴: 아메리카노가 담기지 않았어요");
    expect(result.conditions[3].differences[0]).toBe(
      "결제를 마치지 않았어요 → 미션은 신용·체크카드",
    );
  });

  it("결과 화면 문구: 완료한 주문과 소요 시간", () => {
    expect(realOrderSummary(order(base))).toBe("아이스 아메리카노 Large 2잔 · 포장 · 카드 결제");
    expect(formatDuration(161_000)).toBe("2분 41초");
    expect(formatDuration(9_400)).toBe("9초");
  });
});
