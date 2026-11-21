import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const VISITOR_ID = "visitor-1";

function json(status: number, data: unknown, error: unknown = null) {
  return new Response(JSON.stringify({ success: error === null, data, error }), { status });
}

const visitorOk = () => json(200, { visitor_id: VISITOR_ID, is_new: false });

const sessionOk = (type: string, missionId: number | null) =>
  json(201, {
    session_id: "session-1",
    scenario_id: 1,
    mission_id: missionId,
    session_type: type,
    status: "IN_PROGRESS",
    total_steps: 4,
    current_step: { step_id: 11, step_order: 1, step_name: "메뉴 고르기" },
  });

type FetchMock = ReturnType<typeof vi.fn>;
const call = (fetchMock: FetchMock, index: number) => {
  const [url, init] = fetchMock.mock.calls[index];
  return { url, init, body: init.body ? JSON.parse(init.body) : undefined };
};

beforeEach(() => {
  vi.resetModules();
  const store = new Map<string, string>([["diumi.visitorId", VISITOR_ID]]);
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("startSession", () => {
  it("미션 수행은 방문자 등록 후 REAL_MISSION으로 시나리오·미션 ID를 보내 시작한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(visitorOk())
      .mockResolvedValueOnce(sessionOk("REAL_MISSION", 101));
    vi.stubGlobal("fetch", fetchMock);
    const { startSession } = await import("@/features/api/session");

    const started = await startSession({ service: "cafe", missionId: 101 });

    const request = call(fetchMock, 1);
    expect(request.url).toBe("/api/v1/sessions");
    expect(request.init.headers["X-Visitor-Id"]).toBe(VISITOR_ID);
    expect(request.body).toEqual({ scenario_id: 1, session_type: "REAL_MISSION", mission_id: 101 });
    expect(started).toEqual({
      sessionId: "session-1",
      visitorId: VISITOR_ID,
      totalSteps: 4,
      currentStep: { stepId: 11, stepOrder: 1, stepName: "메뉴 고르기" },
    });
  });

  it("자유 체험은 mission_id 없이 REAL_FREE로 시작한다", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(visitorOk())
      .mockResolvedValueOnce(sessionOk("REAL_FREE", null));
    vi.stubGlobal("fetch", fetchMock);
    const { startSession } = await import("@/features/api/session");

    await startSession({ service: "fastfood" });

    expect(call(fetchMock, 1).body).toEqual({ scenario_id: 2, session_type: "REAL_FREE" });
  });
});

describe("endSession", () => {
  it("상태를 보내 끝내고, keepalive를 켤 수 있다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json(200, {
        session_id: "session-1",
        status: "ABANDONED",
        ended_at: "",
        result_available: false,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { endSession } = await import("@/features/api/session");

    const ended = await endSession({ sessionId: "session-1", visitorId: VISITOR_ID }, "ABANDONED", {
      keepalive: true,
    });

    const request = call(fetchMock, 0);
    expect(request.url).toBe("/api/v1/sessions/session-1/end");
    expect(request.init.keepalive).toBe(true);
    expect(request.init.headers["X-Visitor-Id"]).toBe(VISITOR_ID);
    expect(request.body).toEqual({ status: "ABANDONED" });
    expect(ended).toMatchObject({ status: "ABANDONED", resultAvailable: false });
  });

  it("단계를 다 끝내지 않고 COMPLETED로 끝내면 서버 오류 코드를 그대로 알린다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        json(409, null, {
          code: "SESSION_NOT_READY_TO_COMPLETE",
          message: "아직 완료하지 않은 단계가 있어요.",
        }),
      ),
    );
    const { endSession } = await import("@/features/api/session");

    await expect(
      endSession({ sessionId: "session-1", visitorId: VISITOR_ID }, "COMPLETED"),
    ).rejects.toMatchObject({ status: 409, code: "SESSION_NOT_READY_TO_COMPLETE" });
  });
});

describe("단계 완료·행동 기록·결과", () => {
  const session = { sessionId: "session-1", visitorId: VISITOR_ID };

  it("단계 완료는 반올림한 elapsed_ms를 보낸다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(201, { step_id: 11, is_last_step: false }));
    vi.stubGlobal("fetch", fetchMock);
    const { completeStep } = await import("@/features/api/session");

    await completeStep(session, 11, 1234.6);

    expect(call(fetchMock, 0).url).toBe("/api/v1/sessions/session-1/steps/11/complete");
    expect(call(fetchMock, 0).body).toEqual({ elapsed_ms: 1235 });
  });

  it("행동은 대문자 코드·action_data와 KST 오프셋이 붙은 occurred_at으로 보낸다", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(201, { action_id: 1, is_valid: true }));
    vi.stubGlobal("fetch", fetchMock);
    const { recordAction } = await import("@/features/api/session");

    await recordAction(session, {
      stepId: 27,
      actionType: "NEXT",
      targetCode: "BUTTON_ORDER",
      actionData: {
        items: [{ menu: "MENU_BULGOGI_BURGER", mealType: "MEAL_SET", side: "SIDE_FRIES" }],
      },
      occurredAt: Date.UTC(2026, 10, 19, 8, 29, 6, 824),
    });

    expect(call(fetchMock, 0).url).toBe("/api/v1/sessions/session-1/actions");
    expect(call(fetchMock, 0).body).toEqual({
      step_id: 27,
      action_type: "NEXT",
      target_code: "BUTTON_ORDER",
      action_data: {
        items: [{ menu: "MENU_BULGOGI_BURGER", meal_type: "MEAL_SET", side: "SIDE_FRIES" }],
      },
      occurred_at: "2026-11-19T17:29:06.824+09:00",
    });
  });

  it("수행 결과를 camelCase로 돌려준다", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          json(200, {
            session_id: "session-1",
            elapsed_seconds: 83,
            ai_help_count: 2,
            back_count: 1,
          }),
        ),
    );
    const { getSessionResult } = await import("@/features/api/session");

    await expect(getSessionResult(session)).resolves.toMatchObject({
      elapsedSeconds: 83,
      aiHelpCount: 2,
      backCount: 1,
    });
  });
});

describe("logEvents (mock)", () => {
  it("세션별로 행동을 모아 둔다", async () => {
    const { getMockEvents, logEvents } = await import("@/features/api/session");
    await logEvents("s", [{ type: "screen_view", screen: "dine", elapsedMs: 0 }]);
    await logEvents("s", [
      { type: "tap", screen: "dine", target: "dine:takeout", elapsedMs: 1200 },
    ]);
    expect(getMockEvents("s")).toMatchObject([{ type: "screen_view" }, { target: "dine:takeout" }]);
  });
});
