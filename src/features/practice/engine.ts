import { EMPTY_ORDER, orderReducer, type OrderState } from "@/features/order/order";
import type { PracticeMission, PracticeStep } from "@/features/practice/types";

/**
 * 연습 진행 위치.
 * - intro: 오늘의 미션
 * - step: steps[index] 화면. detour가 있으면 미션과 다르게 골라 바로잡는 중이다
 * - complete: 연습 완료
 */
export type PracticePosition =
  { kind: "intro" } | { kind: "step"; index: number; detour?: number } | { kind: "complete" };

export const START_POSITION: PracticePosition = { kind: "intro" };

/** 지금 화면에 보여 줄 단계. 바로잡는 중이면 안내와 눌러야 할 곳이 바로잡기용으로 바뀐다 */
export type ActiveStep = PracticeStep & {
  correcting: boolean;
  /** 눌러야 할 곳은 아니지만 누르면 선택이 바뀌는 칸. 흐리게 막지 않는다 */
  liveIds: string[];
};

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
    case "step": {
      const before = orderBeforeStep(mission, position.index);
      const detour = detourAt(mission, position);
      return detour ? orderReducer(before, detour.action) : before;
    }
    case "complete":
      return orderBeforeStep(mission, mission.steps.length);
  }
}

function detourAt(mission: PracticeMission, position: PracticePosition) {
  if (position.kind !== "step" || position.detour === undefined) return null;
  const detour = mission.steps[position.index].detours?.[position.detour];
  if (!detour) throw new Error(`없는 detour예요: ${position.index}/${position.detour}`);
  return detour;
}

export function stepAt(mission: PracticeMission, position: PracticePosition): PracticeStep | null {
  return position.kind === "step" ? mission.steps[position.index] : null;
}

export function activeStep(
  mission: PracticeMission,
  position: PracticePosition,
): ActiveStep | null {
  const step = stepAt(mission, position);
  if (!step) return null;

  const detour = detourAt(mission, position);
  if (detour) {
    return {
      ...step,
      guide: detour.guide,
      target: { id: detour.fix.id, label: detour.fix.label },
      action: undefined,
      correcting: true,
      liveIds: [],
    };
  }
  return {
    ...step,
    correcting: false,
    liveIds: step.detours?.map((item) => item.trigger) ?? [],
  };
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
      if (position.detour !== undefined) return { kind: "step", index: position.index };
      return position.index === 0 ? START_POSITION : { kind: "step", index: position.index - 1 };
    case "complete":
      return { kind: "step", index: mission.steps.length - 1 };
  }
}

/** 잘못 눌렀을 때 빨간 안내. guide가 없으면 기본 문구(defaultMissGuide)를 쓴다 */
export type TapResult =
  | { kind: "move"; position: PracticePosition }
  | { kind: "miss"; guide?: { title: string; detail?: string } };

/**
 * 화면의 무언가를 눌렀을 때.
 * - 눌러야 할 곳: 다음 단계로 (바로잡는 중이면 원래 단계로)
 * - 미션과 다르게 고르는 칸: 바로잡기 안내로
 * - 그 밖: 선택을 바꾸지 않고 miss
 */
export function tap(
  mission: PracticeMission,
  position: PracticePosition,
  targetId: string,
): TapResult {
  if (position.kind !== "step") return { kind: "miss" };
  const step = mission.steps[position.index];

  if (position.detour !== undefined) {
    return detourAt(mission, position)?.fix.id === targetId
      ? { kind: "move", position: { kind: "step", index: position.index } }
      : { kind: "miss" };
  }
  if (step.target.id === targetId) {
    return { kind: "move", position: nextPosition(mission, position) };
  }
  const detour = step.detours?.findIndex((item) => item.trigger === targetId) ?? -1;
  if (detour >= 0) {
    return { kind: "move", position: { kind: "step", index: position.index, detour } };
  }
  const mistake = step.mistakes?.find((item) => item.trigger === targetId);
  return mistake ? { kind: "miss", guide: mistake.guide } : { kind: "miss" };
}

/** 잘못 눌렀을 때 빨간 말풍선 문구 */
export function missMessage(step: Pick<PracticeStep, "target">): string {
  return `다른 곳을 눌렀어요. 주황 테두리의 ${step.target.label} 눌러 보세요`;
}

/** 기본 빨간 안내 (PX1) */
export function defaultMissGuide(step: Pick<PracticeStep, "target">) {
  return { title: missMessage(step), detail: "선택은 바뀌지 않았어요" };
}
