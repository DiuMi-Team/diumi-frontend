import type { PracticeService } from "@/features/practice/types";

/**
 * 화면 진행 단계(1~9) → 백엔드 시나리오 단계 연결표.
 * 백엔드 단계는 카페 4개·패스트푸드 6개라, 화면 여러 개를 한 단계로 묶는다.
 * 각 단계는 마지막 화면(lastProgress)을 벗어나 다음 화면으로 갈 때 완료한다.
 * 백엔드가 9단계로 바뀌면 이 표만 1:1로 고친다.
 */
type BackendStep = { stepId: number; name: string; lastProgress: number };

export const BACKEND_STEPS: Record<PracticeService, readonly BackendStep[]> = {
  cafe: [
    { stepId: 11, name: "메뉴 고르기", lastProgress: 2 }, // 1 매장·포장, 2 메뉴
    { stepId: 12, name: "옵션 고르기", lastProgress: 3 }, // 3 옵션 (유료·무료 포함)
    { stepId: 13, name: "주문 확인", lastProgress: 6 }, // 4 메뉴 더 담기, 5 장바구니, 6 멤버십·쿠폰
    { stepId: 14, name: "결제하기", lastProgress: 9 }, // 7 결제 방식, 8 결제, 9 결제 완료
  ],
  fastfood: [
    { stepId: 21, name: "메뉴 고르기", lastProgress: 2 }, // 1 매장·포장, 2 메뉴
    { stepId: 22, name: "단품 또는 세트 고르기", lastProgress: 3 }, // 3 세트·단품
    { stepId: 23, name: "사이드 고르기", lastProgress: 4 }, // 4 사이드·음료 (한 화면)
    { stepId: 24, name: "음료 고르기", lastProgress: 4 },
    { stepId: 25, name: "주문 확인", lastProgress: 7 }, // 5 장바구니 담기, 6 메뉴 더 고르기, 7 주문 확인
    { stepId: 26, name: "결제하기", lastProgress: 9 }, // 8 결제, 9 결제 완료
  ],
};

/** 모든 백엔드 단계 ID (순서대로) */
export function allStepIds(service: PracticeService): number[] {
  return BACKEND_STEPS[service].map((step) => step.stepId);
}

/** 화면 진행 단계 progress에 들어왔을 때 이미 끝난 백엔드 단계 ID (순서대로) */
export function stepIdsBefore(service: PracticeService, progress: number): number[] {
  return BACKEND_STEPS[service]
    .filter((step) => step.lastProgress < progress)
    .map((step) => step.stepId);
}

/** 아직 완료하지 않은 첫 단계. 도움 요청·뒤로 가기는 이 단계에서 일어난 것으로 기록한다 */
export function activeStepId(
  service: PracticeService,
  completed: ReadonlySet<number>,
): number | null {
  return allStepIds(service).find((id) => !completed.has(id)) ?? null;
}
