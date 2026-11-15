/**
 * 체험 세션 API. 지금은 백엔드 연동 전이라 mock으로 동작한다.
 * 실제 연동할 때는 이 파일의 함수 내용만 fetch 호출로 바꾸고, 화면 코드는 그대로 둔다.
 *
 * 화면은 이 함수들이 실패해도 멈추지 않아야 한다. 부르는 쪽에서 오류를 삼킨다.
 */

export type SessionMode = "mission" | "free";

export type StartSessionInput = {
  mode: SessionMode;
  service: "cafe" | "fastfood";
  missionId?: string;
};

export type SessionEvent = {
  /** 예: "screen_view", "tap", "help_open" */
  type: string;
  screen: string;
  /** 누른 것이나 바뀐 값. 예: "menu:americano" */
  target?: string;
  /** 세션 시작부터 지난 시간(ms) */
  elapsedMs: number;
};

export type SessionSummary = {
  success: boolean;
  elapsedMs: number;
  helpCount: number;
};

/** mock 저장소. 개발 중 확인과 테스트용으로만 쓴다 */
type MockSession = StartSessionInput & {
  id: string;
  events: SessionEvent[];
  summary?: SessionSummary;
};

const mockSessions = new Map<string, MockSession>();
let mockSequence = 0;

export async function startSession(input: StartSessionInput): Promise<{ sessionId: string }> {
  mockSequence += 1;
  const id = `mock-session-${mockSequence}`;
  mockSessions.set(id, { ...input, id, events: [] });
  return { sessionId: id };
}

/** 행동 기록. 여러 건을 모아서 한 번에 보낸다 */
export async function logEvents(sessionId: string, events: SessionEvent[]): Promise<void> {
  mockSessions.get(sessionId)?.events.push(...events);
}

export async function endSession(
  sessionId: string,
  summary: SessionSummary,
): Promise<SessionSummary> {
  const session = mockSessions.get(sessionId);
  if (session) session.summary = summary;
  return summary;
}

/** 테스트에서 mock에 쌓인 기록을 확인할 때 쓴다 */
export function getMockSession(sessionId: string): MockSession | undefined {
  return mockSessions.get(sessionId);
}
