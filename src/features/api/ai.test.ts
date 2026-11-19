import { afterEach, describe, expect, it, vi } from "vitest";
import { saveAiMessages, startAiConnection } from "@/features/api/ai";

const session = { sessionId: "session-1", visitorId: "visitor-1" };

function mockFetch(status: number, data: unknown) {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      new Response(JSON.stringify({ success: true, data, error: null }), { status }),
    );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AI 음성 API", () => {
  it("연결은 step_id만 보내고(screen_code는 목록 확인 전이라 생략) 임시 키를 돌려준다", async () => {
    const fetchMock = mockFetch(201, {
      client_secret: "ek_abc",
      expires_at: "2026-11-19T18:10:35+09:00",
      model: "gpt-realtime",
      conversation_id: "sess_1",
    });

    const connection = await startAiConnection(session, { stepId: 11 });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/sessions/session-1/ai/connections");
    expect(init.headers["X-Visitor-Id"]).toBe("visitor-1");
    expect(JSON.parse(init.body)).toEqual({ step_id: 11 });
    expect(connection).toMatchObject({ clientSecret: "ek_abc", model: "gpt-realtime" });
  });

  it("질문·답변을 snake_case로 저장한다", async () => {
    const fetchMock = mockFetch(201, { question_message_id: 3, answer_message_id: 4 });

    await saveAiMessages(session, {
      stepId: 12,
      question: "아메리카노는 어디 있어요?",
      answer: "커피 탭에 있어요.",
      responseTimeMs: 812.4,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/sessions/session-1/ai/messages");
    expect(JSON.parse(init.body)).toEqual({
      step_id: 12,
      question: "아메리카노는 어디 있어요?",
      answer: "커피 탭에 있어요.",
      response_time_ms: 812,
    });
  });
});
