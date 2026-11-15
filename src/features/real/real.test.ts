import { describe, expect, it } from "vitest";
import { endSession, getMockSession, logEvents, startSession } from "@/features/api/session";
import { EMPTY_ORDER, orderReducer, type OrderAction } from "@/features/order/order";
import { realProgress } from "@/features/real/flow";
import { realDrinkDetail, realDrinkName } from "@/features/real/labels";
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
