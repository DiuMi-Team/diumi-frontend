import { describe, expect, it } from "vitest";
import { cartTotal, formatWon } from "@/features/order/order";
import { orderAt } from "@/features/practice/engine";
import { cafeBasic, PRACTICE_MISSIONS } from "@/features/practice/missions";

describe.each(PRACTICE_MISSIONS.map((mission) => [mission.id, mission] as const))(
  "미션 데이터 %s",
  (_, mission) => {
    it("단계 번호는 1부터 총 단계까지 줄지 않고 이어진다", () => {
      const stages = mission.steps.map((step) => step.progress.stage);
      expect(stages[0]).toBe(1);
      expect(stages.at(-1)).toBe(mission.totalStages);
      stages.slice(1).forEach((stage, i) => {
        expect(stage - stages[i]).toBeGreaterThanOrEqual(0);
        expect(stage - stages[i]).toBeLessThanOrEqual(1);
      });
    });

    it("화면 ID는 겹치지 않는다", () => {
      const ids = mission.steps.map((step) => step.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it("모든 동작을 처음부터 끝까지 오류 없이 적용하고 결제까지 마친다", () => {
      const final = orderAt(mission, { kind: "complete" });
      expect(final.paid).toBe(true);
      expect(final.draft).toBeNull();
    });

    it("잘못 눌렀을 때 문구에 쓸 조사가 붙어 있다", () => {
      mission.steps.forEach((step) => expect(step.target.label).toMatch(/[을를]$/));
    });

    it("완료 화면 요약의 결제 금액이 실제 합계와 같다", () => {
      const total = formatWon(cartTotal(orderAt(mission, { kind: "complete" }).cart));
      expect(mission.summary.some((line) => line.includes(total))).toBe(true);
    });
  },
);

describe("카페 기본 미션", () => {
  it("아메리카노 HOT · Regular 1잔을 포장으로 카드 결제해 3,200원이다", () => {
    const final = orderAt(cafeBasic, { kind: "complete" });
    expect(final.dineOption).toBe("takeout");
    expect(final.paymentMethod).toBe("card");
    expect(final.cart).toEqual([
      { menuId: "americano", temperature: "hot", size: "regular", quantity: 1 },
    ]);
    expect(cartTotal(final.cart)).toBe(3200);
  });

  it("디자인의 PC02~PC11 화면을 순서대로 거친다", () => {
    expect(cafeBasic.steps.map((step) => step.id)).toEqual(
      Array.from({ length: 10 }, (_, i) => `PC${String(i + 2).padStart(2, "0")}`),
    );
  });
});
