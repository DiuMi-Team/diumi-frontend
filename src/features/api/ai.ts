import { apiRequest } from "@/features/api/client";
import type { StartedSession } from "@/features/api/session";

/**
 * AI 음성 도우미 API (실전 세션 전용).
 * - API 8: 백엔드가 OpenAI Realtime 세션을 만들고, 브라우저가 WebRTC 연결에 쓸 짧은 시간용 키를 준다.
 * - API 9: 브라우저가 받은 최종 질문·답변 transcript를 저장한다.
 * OpenAI API 키는 백엔드에만 있다.
 */

type SessionRef = Pick<StartedSession, "sessionId" | "visitorId">;

export type AiConnection = {
  /** OpenAI Realtime WebRTC 연결에 쓰는 임시 키 (ek_…) */
  clientSecret: string;
  expiresAt: string;
  model: string;
  conversationId: string;
};

/**
 * screen_code는 백엔드가 정한 화면 코드만 받는다(features/real/screen-codes.ts).
 * 목록 밖의 값(예: "menu", "PAYMENT")을 보내면 400 INVALID_REQUEST다.
 * 백엔드는 연결 횟수를 도움 요청 횟수(ai_help_count)로 센다.
 */
export function startAiConnection(
  session: SessionRef,
  input: { stepId: number; screenCode?: string },
): Promise<AiConnection> {
  return apiRequest(`/sessions/${session.sessionId}/ai/connections`, {
    method: "POST",
    visitorId: session.visitorId,
    body: { stepId: input.stepId, screenCode: input.screenCode },
  });
}

export type AiTurn = {
  stepId: number;
  question: string;
  answer: string;
  /** 사용자가 말을 마친 뒤 AI 답변이 시작될 때까지 걸린 시간(ms) */
  responseTimeMs: number;
};

export function saveAiMessages(session: SessionRef, turn: AiTurn): Promise<unknown> {
  return apiRequest(`/sessions/${session.sessionId}/ai/messages`, {
    method: "POST",
    visitorId: session.visitorId,
    body: {
      stepId: turn.stepId,
      question: turn.question,
      answer: turn.answer,
      responseTimeMs: Math.max(0, Math.round(turn.responseTimeMs)),
    },
  });
}
