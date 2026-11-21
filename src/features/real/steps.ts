import type { PracticeService } from "@/features/practice/types";

/**
 * 화면 진행 단계(1~9) → 백엔드 시나리오 단계. 백엔드도 9단계라 1:1로 맞는다.
 * 각 단계는 그 화면을 벗어나 다음 화면으로 갈 때 완료한다.
 * 9단계를 모두 완료해야 세션을 COMPLETED로 끝낼 수 있다.
 */
type BackendStep = { stepId: number; code: string; progress: number };

export const BACKEND_STEPS: Record<PracticeService, readonly BackendStep[]> = {
  cafe: [
    { stepId: 11, code: "SELECT_ORDER_TYPE", progress: 1 },
    { stepId: 12, code: "SELECT_MENU", progress: 2 },
    { stepId: 13, code: "SELECT_OPTION", progress: 3 },
    { stepId: 14, code: "ADD_MORE_MENU", progress: 4 },
    { stepId: 15, code: "CART", progress: 5 },
    { stepId: 16, code: "MEMBERSHIP", progress: 6 },
    { stepId: 17, code: "SELECT_PAYMENT", progress: 7 },
    { stepId: 18, code: "PAYMENT", progress: 8 },
    { stepId: 19, code: "ORDER_COMPLETE", progress: 9 },
  ],
  fastfood: [
    { stepId: 21, code: "SELECT_ORDER_TYPE", progress: 1 },
    { stepId: 22, code: "SELECT_MENU", progress: 2 },
    { stepId: 23, code: "SELECT_MEAL_TYPE", progress: 3 },
    { stepId: 24, code: "SELECT_SIDE_DRINK", progress: 4 },
    { stepId: 25, code: "ADD_TO_CART", progress: 5 },
    { stepId: 26, code: "SELECT_EXTRA_MENU", progress: 6 },
    { stepId: 27, code: "ORDER_REVIEW", progress: 7 },
    { stepId: 28, code: "PAYMENT", progress: 8 },
    { stepId: 29, code: "ORDER_COMPLETE", progress: 9 },
  ],
};

/** 모든 백엔드 단계 ID (순서대로) */
export function allStepIds(service: PracticeService): number[] {
  return BACKEND_STEPS[service].map((step) => step.stepId);
}

/** 화면 진행 단계의 백엔드 단계 ID. 행동은 그 행동이 일어난 화면의 단계로 기록한다 */
export function stepIdForProgress(service: PracticeService, progress: number): number {
  const steps = BACKEND_STEPS[service];
  return (steps.find((step) => step.progress === progress) ?? steps[0]).stepId;
}

/** 화면 진행 단계 progress에 들어왔을 때 이미 지나온 백엔드 단계 ID (순서대로) */
export function stepIdsBefore(service: PracticeService, progress: number): number[] {
  return BACKEND_STEPS[service]
    .filter((step) => step.progress < progress)
    .map((step) => step.stepId);
}

/** 아직 완료하지 않은 첫 단계 (AI 연결 단계로 쓴다) */
export function activeStepId(
  service: PracticeService,
  completed: ReadonlySet<number>,
): number | null {
  return allStepIds(service).find((id) => !completed.has(id)) ?? null;
}
