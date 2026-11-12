import { describe, expect, it } from "vitest";
import {
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
  waitingNumber: 1,
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
    expect(tap(mission, step(0), "dine:takeout")).toEqual({ kind: "advance", position: step(1) });
    expect(tap(mission, step(1), "menu:americano")).toEqual({
      kind: "advance",
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
        cart: [{ menuId: "latte", temperature: "hot", size: "regular", quantity: 1 }],
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
