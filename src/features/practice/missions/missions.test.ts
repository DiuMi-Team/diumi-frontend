import { describe, expect, it } from "vitest";
import {
  cartTotal,
  formatWon,
  itemDetail,
  orderReducer,
  payableTotal,
} from "@/features/order/order";
import { orderAt, orderBeforeStep } from "@/features/practice/engine";
import {
  cafeBasic,
  cafeCoupon,
  cafeOptions,
  fastfoodBasic,
  PRACTICE_MISSIONS,
} from "@/features/practice/missions";

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
      mission.steps
        .flatMap((step) => step.detours ?? [])
        .forEach((detour) => expect(detour.fix.label).toMatch(/[을를]$/));
    });

    it("다르게 고른 것을 바로잡으면 원래 단계의 상태로 정확히 돌아온다", () => {
      mission.steps.forEach((step, index) => {
        const before = orderBeforeStep(mission, index);
        step.detours?.forEach((detour) => {
          const changed = orderReducer(before, detour.action);
          expect(changed).not.toEqual(before);
          expect(orderReducer(changed, detour.fix.action)).toEqual(before);
        });
      });
    });

    it("완료 화면 요약의 결제 금액이 실제 합계와 같다", () => {
      const total = formatWon(payableTotal(orderAt(mission, { kind: "complete" })));
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
      {
        type: "drink",
        menuId: "americano",
        temperature: "hot",
        size: "regular",
        quantity: 1,
        paidOptions: {},
      },
    ]);
    expect(cartTotal(final.cart)).toBe(3200);
  });

  it("디자인의 PC02~PC11 화면을 순서대로 거친다", () => {
    expect(cafeBasic.steps.map((step) => step.id)).toEqual(
      Array.from({ length: 10 }, (_, i) => `PC${String(i + 2).padStart(2, "0")}`),
    );
  });
});

describe("카페 옵션 포함 미션", () => {
  it("아메리카노 ICE · Large 2잔과 카페모카 HOT · Regular · 휘핑크림 1잔, 12,700원이다", () => {
    const final = orderAt(cafeOptions, { kind: "complete" });
    expect(final.cart.map((item) => [item.menuId, itemDetail(item), item.quantity])).toEqual([
      ["americano", "ICE · Large", 2],
      ["mocha", "HOT · Regular · 휘핑크림", 1],
    ]);
    expect(cartTotal(final.cart)).toBe(12700);
  });

  it("디자인의 PA02~PA19 화면을 순서대로 거친다", () => {
    expect(cafeOptions.steps.map((step) => step.id)).toEqual(
      Array.from({ length: 18 }, (_, i) => `PA${String(i + 2).padStart(2, "0")}`),
    );
  });
});

describe("카페 쿠폰 미션", () => {
  it("카페라떼 1잔이 담긴 상태에서 시작한다", () => {
    const start = orderAt(cafeCoupon, { kind: "intro" });
    expect(start.dineOption).toBe("takeout");
    expect(start.cart.map((item) => [item.menuId, itemDetail(item), item.quantity])).toEqual([
      ["latte", "HOT · Regular", 1],
    ]);
    expect(start.couponId).toBeNull();
  });

  it("1,000원 쿠폰을 써서 4,200원 중 3,200원을 카드로 결제한다", () => {
    const final = orderAt(cafeCoupon, { kind: "complete" });
    expect(final.couponId).toBe("drink1000");
    expect(cartTotal(final.cart)).toBe(4200);
    expect(payableTotal(final)).toBe(3200);
    expect(final.paymentMethod).toBe("card");
  });

  it("디자인의 PD02~PD08 화면을 순서대로 거친다", () => {
    expect(cafeCoupon.steps.map((step) => step.id)).toEqual(
      Array.from({ length: 7 }, (_, i) => `PD${String(i + 2).padStart(2, "0")}`),
    );
  });
});

describe("패스트푸드 단품 기본 미션", () => {
  it("불고기버거 단품 1개를 매장에서 먹기로 카드 결제해 4,800원이다", () => {
    const final = orderAt(fastfoodBasic, { kind: "complete" });
    expect(final.dineOption).toBe("dineIn");
    expect(final.paymentMethod).toBe("card");
    expect(final.cart).toEqual([{ type: "burger", menuId: "bulgogi", set: false, quantity: 1 }]);
    expect(payableTotal(final)).toBe(4800);
  });

  it("디자인의 PE02~PE10 화면을 순서대로 거친다", () => {
    expect(fastfoodBasic.steps.map((step) => step.id)).toEqual(
      Array.from({ length: 9 }, (_, i) => `PE${String(i + 2).padStart(2, "0")}`),
    );
  });
});
