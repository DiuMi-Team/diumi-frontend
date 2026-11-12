import { EMPTY_ORDER, orderReducer, type OrderState } from "@/features/order/order";
import type { PracticeMission, PracticeStep } from "@/features/practice/types";

/**
 * 연습 진행 위치.
 * - intro: 오늘의 미션
 * - step: steps[index] 화면
 * - complete: 연습 완료
 */
export type PracticePosition =
  { kind: "intro" } | { kind: "step"; index: number } | { kind: "complete" };

export const START_POSITION: PracticePosition = { kind: "intro" };

export function initialOrder(mission: PracticeMission): OrderState {
  return { ...EMPTY_ORDER, ...mission.initialOrder };
}

/**
 * steps[index] 화면에 들어왔을 때의 주문 상태.
 * 그 앞 단계들의 동작을 처음부터 다시 적용하므로, 이전으로 가도 상태가 저절로 되돌아간다.
 */
export function orderBeforeStep(mission: PracticeMission, index: number): OrderState {
  return mission.steps
    .slice(0, index)
    .reduce<OrderState>(
      (state, step) => (step.action ? orderReducer(state, step.action) : state),
      initialOrder(mission),
    );
}

export function orderAt(mission: PracticeMission, position: PracticePosition): OrderState {
  switch (position.kind) {
    case "intro":
      return initialOrder(mission);
    case "step":
      return orderBeforeStep(mission, position.index);
    case "complete":
      return orderBeforeStep(mission, mission.steps.length);
  }
}

export function stepAt(mission: PracticeMission, position: PracticePosition): PracticeStep | null {
  return position.kind === "step" ? mission.steps[position.index] : null;
}

export function nextPosition(
  mission: PracticeMission,
  position: PracticePosition,
): PracticePosition {
  switch (position.kind) {
    case "intro":
      return { kind: "step", index: 0 };
    case "step":
      return position.index + 1 < mission.steps.length
        ? { kind: "step", index: position.index + 1 }
        : { kind: "complete" };
    case "complete":
      return position;
  }
}

/** 오늘의 미션에서는 이전 화면이 없다. 그때는 null을 돌려주고 화면이 미션 선택으로 보낸다 */
export function previousPosition(
  mission: PracticeMission,
  position: PracticePosition,
): PracticePosition | null {
  switch (position.kind) {
    case "intro":
      return null;
    case "step":
      return position.index === 0 ? START_POSITION : { kind: "step", index: position.index - 1 };
    case "complete":
      return { kind: "step", index: mission.steps.length - 1 };
  }
}

export type TapResult = { kind: "advance"; position: PracticePosition } | { kind: "miss" };

/** 화면의 무언가를 눌렀을 때. 눌러야 할 곳이면 다음으로, 아니면 선택을 바꾸지 않고 miss */
export function tap(
  mission: PracticeMission,
  position: PracticePosition,
  targetId: string,
): TapResult {
  const step = stepAt(mission, position);
  if (!step || step.target.id !== targetId) return { kind: "miss" };
  return { kind: "advance", position: nextPosition(mission, position) };
}

/** 잘못 눌렀을 때 빨간 말풍선 문구 */
export function missMessage(step: PracticeStep): string {
  return `다른 곳을 눌렀어요. 주황 테두리의 ${step.target.label} 눌러 보세요`;
}
