import { describe, expect, it } from "vitest";
import {
  activeStep,
  missMessage,
  nextPosition,
  orderAt,
  orderBeforeStep,
  previousPosition,
  START_POSITION,
  stepAt,
  tap,
  type PracticePosition,
} from "@/features/practice/engine";
import type { PracticeMission } from "@/features/practice/types";

const mission: PracticeMission = {
  id: "test",
  service: "cafe",
  title: "테스트",
  totalStages: 2,
  selectHref: "/cafe/practice",
  realHref: "/cafe/real",
  intro: { items: [], estimatedMinutes: 1 },
  steps: [
    {
      id: "S1",
      screen: "dineOption",
      progress: { stage: 1, detail: "포장" },
      guide: { title: "포장을 눌러 보세요" },
      target: { id: "dine:takeout", label: "포장해서 갈래요를" },
      action: { type: "setDineOption", value: "takeout" },
    },
    {
      id: "S2",
      screen: "menu",
      progress: { stage: 2, detail: "메뉴" },
      guide: { title: "아메리카노를 눌러 보세요" },
      target: { id: "menu:americano", label: "아메리카노를" },
      action: { type: "selectMenu", menuId: "americano" },
    },
  ],
  orderNumber: "1",
  summary: [],
};

const step = (index: number): PracticePosition => ({ kind: "step", index });

describe("연습 엔진 이동", () => {
  it("오늘의 미션 → 단계들 → 연습 완료 순서로 간다", () => {
    let position = START_POSITION;
    const visited: string[] = [];
    while (position.kind !== "complete") {
      visited.push(position.kind === "step" ? mission.steps[position.index].id : "intro");
      position = nextPosition(mission, position);
    }
    expect(visited).toEqual(["intro", "S1", "S2"]);
  });

  it("이전으로는 한 칸씩 돌아가고, 오늘의 미션에서는 갈 곳이 없다", () => {
    expect(previousPosition(mission, { kind: "complete" })).toEqual(step(1));
    expect(previousPosition(mission, step(1))).toEqual(step(0));
    expect(previousPosition(mission, step(0))).toEqual(START_POSITION);
    expect(previousPosition(mission, START_POSITION)).toBeNull();
  });
});

describe("누르기 판정", () => {
  it("눌러야 할 곳을 누르면 다음 단계로 간다", () => {
    expect(tap(mission, step(0), "dine:takeout")).toEqual({ kind: "move", position: step(1) });
    expect(tap(mission, step(1), "menu:americano")).toEqual({
      kind: "move",
      position: { kind: "complete" },
    });
  });

  it("다른 곳을 누르면 miss이고 위치는 그대로다", () => {
    expect(tap(mission, step(0), "dine:dineIn")).toEqual({ kind: "miss" });
    expect(tap(mission, START_POSITION, "dine:takeout")).toEqual({ kind: "miss" });
  });

  it("잘못 눌렀을 때 눌러야 할 곳을 알려 준다", () => {
    expect(missMessage(mission.steps[1])).toBe(
      "다른 곳을 눌렀어요. 주황 테두리의 아메리카노를 눌러 보세요",
    );
  });
});

describe("단계별 주문 상태", () => {
  it("단계에 들어왔을 때는 그 앞 단계의 동작까지만 적용돼 있다", () => {
    expect(orderBeforeStep(mission, 0).dineOption).toBeNull();
    expect(orderBeforeStep(mission, 1).dineOption).toBe("takeout");
    expect(orderBeforeStep(mission, 1).draft).toBeNull();
    expect(orderAt(mission, { kind: "complete" }).draft?.menuId).toBe("americano");
  });

  it("이전으로 돌아가면 그 단계의 선택이 되돌아간다", () => {
    const back = previousPosition(mission, step(1));
    expect(back).not.toBeNull();
    expect(orderAt(mission, back!).dineOption).toBeNull();
  });

  it("시작 상태를 미리 채울 수 있다 (쿠폰 미션)", () => {
    const prefilled: PracticeMission = {
      ...mission,
      initialOrder: {
        cart: [
          {
            type: "drink",
            menuId: "latte",
            temperature: "hot",
            size: "regular",
            quantity: 1,
            paidOptions: {},
          },
        ],
      },
    };
    expect(orderAt(prefilled, START_POSITION).cart).toHaveLength(1);
    expect(orderAt(prefilled, { kind: "complete" }).cart[0].menuId).toBe("latte");
  });

  it("stepAt은 단계 화면에서만 단계를 돌려준다", () => {
    expect(stepAt(mission, START_POSITION)).toBeNull();
    expect(stepAt(mission, step(1))?.id).toBe("S2");
  });
});

describe("미션과 다르게 고른 경우 (PX2)", () => {
  const withDetour: PracticeMission = {
    ...mission,
    steps: [
      mission.steps[0],
      {
        id: "Q",
        screen: "options",
        progress: { stage: 2, detail: "수량" },
        guide: { title: "선택 완료를 눌러 보세요" },
        target: { id: "options:confirm", label: "선택 완료를" },
        detours: [
          {
            trigger: "dine:dineIn",
            action: { type: "setDineOption", value: "dineIn" },
            guide: { title: "미션은 포장이에요", detail: "지금은 매장이에요" },
            fix: {
              id: "dine:takeout",
              label: "포장을",
              action: { type: "setDineOption", value: "takeout" },
            },
          },
        ],
      },
    ],
  };
  const detour: PracticePosition = { kind: "step", index: 1, detour: 0 };

  it("다르게 고르는 칸을 누르면 선택이 바뀌고 바로잡기 안내로 간다", () => {
    expect(tap(withDetour, step(1), "dine:dineIn")).toEqual({ kind: "move", position: detour });
    expect(orderAt(withDetour, detour).dineOption).toBe("dineIn");
  });

  it("바로잡는 중에는 안내와 눌러야 할 곳이 바뀐다", () => {
    const active = activeStep(withDetour, detour)!;
    expect(active.correcting).toBe(true);
    expect(active.guide.title).toBe("미션은 포장이에요");
    expect(active.target.id).toBe("dine:takeout");
  });

  it("평소에는 다르게 고르는 칸을 막지 않는다", () => {
    expect(activeStep(withDetour, step(1))!.liveIds).toEqual(["dine:dineIn"]);
  });

  it("바로잡으면 원래 단계로 돌아가고, 다른 곳은 miss다", () => {
    expect(tap(withDetour, detour, "dine:takeout")).toEqual({ kind: "move", position: step(1) });
    expect(tap(withDetour, detour, "options:confirm")).toEqual({ kind: "miss" });
  });

  it("바로잡는 중에 이전으로를 누르면 원래 단계로 돌아간다", () => {
    expect(previousPosition(withDetour, detour)).toEqual(step(1));
  });
});
