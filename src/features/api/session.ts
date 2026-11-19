import { apiRequest } from "@/features/api/client";
import { ensureVisitor } from "@/features/api/visitor";
import type { PracticeService } from "@/features/practice/types";

/**
 * 실전 체험 세션 API.
 * - 시작·종료, 단계 완료, 도움 요청·뒤로 가기 기록, 수행 결과는 실제 백엔드를 부른다.
 * - 메뉴·옵션 같은 나머지 행동 기록(logEvents)은 백엔드 target_code 형식이 정해질 때까지 mock으로 둔다.
 *
 * 화면은 이 함수들이 실패해도 멈추지 않아야 한다. 부르는 쪽에서 오류를 삼킨다.
 */

/** 백엔드 시나리오 ID (GET /scenarios). 화면의 카페·패스트푸드가 고정이라 상수로 둔다 */
export const SCENARIO_IDS: Record<PracticeService, number> = { cafe: 1, fastfood: 2 };

export type SessionType = "REAL_MISSION" | "REAL_FREE";
export type SessionEndStatus = "COMPLETED" | "ABANDONED";

export type StartSessionInput = {
  service: PracticeService;
  /** 백엔드 미션 ID. 없으면 자유 체험(REAL_FREE)으로 시작한다 */
  missionId?: number;
};

export type SessionStep = {
  stepId: number;
  stepOrder: number;
  stepName: string;
};

/** 시작한 세션. 종료할 때 visitorId가 함께 필요해서 같이 들고 다닌다 */
export type StartedSession = {
  sessionId: string;
  visitorId: string;
  totalSteps: number;
  currentStep: SessionStep | null;
};

type StartSessionResponse = {
  sessionId: string;
  totalSteps: number;
  currentStep: SessionStep | null;
};

export async function startSession({
  service,
  missionId,
}: StartSessionInput): Promise<StartedSession> {
  const { visitorId } = await ensureVisitor();
  const sessionType: SessionType = missionId === undefined ? "REAL_FREE" : "REAL_MISSION";
  const data = await apiRequest<StartSessionResponse>("/sessions", {
    method: "POST",
    visitorId,
    body: { scenarioId: SCENARIO_IDS[service], sessionType, missionId },
  });
  return {
    sessionId: data.sessionId,
    visitorId,
    totalSteps: data.totalSteps,
    currentStep: data.currentStep,
  };
}

export type EndSessionResponse = {
  sessionId: string;
  status: "IN_PROGRESS" | SessionEndStatus;
  endedAt: string;
  resultAvailable: boolean;
};

/**
 * 세션을 끝낸다. 결제를 마치면 COMPLETED, 중간에 그만두면 ABANDONED.
 * COMPLETED는 모든 단계를 완료해야 받아 준다(아니면 409 SESSION_NOT_READY_TO_COMPLETE).
 * 탭을 닫을 때도 요청이 끝까지 가도록 keepalive를 켤 수 있다.
 */
export function endSession(
  session: Pick<StartedSession, "sessionId" | "visitorId">,
  status: SessionEndStatus,
  options: { keepalive?: boolean } = {},
): Promise<EndSessionResponse> {
  return apiRequest<EndSessionResponse>(`/sessions/${session.sessionId}/end`, {
    method: "POST",
    visitorId: session.visitorId,
    body: { status },
    keepalive: options.keepalive,
  });
}

type SessionRef = Pick<StartedSession, "sessionId" | "visitorId">;

export type CompleteStepResponse = {
  stepId: number;
  elapsedMs: number;
  errorCount: number;
  aiHelpCount: number;
  nextStep: SessionStep | null;
  isLastStep: boolean;
};

/** 단계 완료. 같은 단계를 다시 보내면 409(STEP_ALREADY_COMPLETED)다 */
export function completeStep(
  session: SessionRef,
  stepId: number,
  elapsedMs: number,
): Promise<CompleteStepResponse> {
  return apiRequest(`/sessions/${session.sessionId}/steps/${stepId}/complete`, {
    method: "POST",
    visitorId: session.visitorId,
    body: { elapsedMs: Math.max(0, Math.round(elapsedMs)) },
  });
}

/** 백엔드 행동 유형. 지금은 action_data가 필요 없는 AI_HELP·BACK만 보낸다 */
export type ActionType = "AI_HELP" | "BACK";

/** 백엔드는 occurred_at을 KST 오프셋이 붙은 ISO 8601로 받는다. 예: 2026-11-19T17:29:06.824+09:00 */
export function toKstIsoString(ms: number): string {
  return new Date(ms + 9 * 60 * 60 * 1000).toISOString().replace("Z", "+09:00");
}

export function recordAction(
  session: SessionRef,
  action: { stepId: number; actionType: ActionType; occurredAt: number },
): Promise<unknown> {
  return apiRequest(`/sessions/${session.sessionId}/actions`, {
    method: "POST",
    visitorId: session.visitorId,
    body: {
      stepId: action.stepId,
      actionType: action.actionType,
      occurredAt: toKstIsoString(action.occurredAt),
    },
  });
}

export type SessionResult = {
  sessionId: string;
  /** 자유 체험은 null */
  isSuccess: boolean | null;
  /** 세션 시작부터 종료까지 걸린 시간(초) */
  elapsedSeconds: number;
  aiHelpCount: number;
  errorCount: number | null;
  backCount: number;
};

/** 수행 결과. COMPLETED로 끝난 세션만 있고, 아니면 404(RESULT_NOT_FOUND)다 */
export function getSessionResult(session: SessionRef): Promise<SessionResult> {
  return apiRequest(`/sessions/${session.sessionId}/result`, { visitorId: session.visitorId });
}

/* ---------- 행동 기록 (mock) ---------- */

export type SessionEvent = {
  /** 예: "screen_view", "tap", "help_open" */
  type: string;
  screen: string;
  /** 누른 것이나 바뀐 값. 예: "menu:americano" */
  target?: string;
  /** 세션 시작부터 지난 시간(ms) */
  elapsedMs: number;
};

const mockEvents = new Map<string, SessionEvent[]>();

/** 행동 기록. 여러 건을 모아서 한 번에 보낸다. 백엔드 actions 형식이 정해지면 바꾼다 */
export async function logEvents(sessionId: string, events: SessionEvent[]): Promise<void> {
  mockEvents.set(sessionId, [...(mockEvents.get(sessionId) ?? []), ...events]);
}

/** 테스트에서 mock에 쌓인 행동 기록을 확인할 때 쓴다 */
export function getMockEvents(sessionId: string): SessionEvent[] {
  return mockEvents.get(sessionId) ?? [];
}
