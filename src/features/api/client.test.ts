import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest, ApiRequestError, toCamelKeys, toSnakeKeys } from "@/features/api/client";

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("키 변환", () => {
  it("응답의 snake_case 키를 중첩까지 camelCase로 바꾼다", () => {
    expect(
      toCamelKeys({ visitor_id: "v", current_step: { step_id: 1 }, list: [{ is_new: true }] }),
    ).toEqual({ visitorId: "v", currentStep: { stepId: 1 }, list: [{ isNew: true }] });
  });

  it("요청의 camelCase 키를 snake_case로 바꾼다", () => {
    expect(toSnakeKeys({ scenarioId: 1, sessionType: "REAL_MISSION" })).toEqual({
      scenario_id: 1,
      session_type: "REAL_MISSION",
    });
  });
});

describe("apiRequest", () => {
  it("같은 주소의 /api/v1 로 snake_case 본문과 방문자 헤더를 보내고 data를 돌려준다", async () => {
    const fetchMock = mockFetch(200, {
      success: true,
      data: { visitor_id: "v-1", is_new: false },
      error: null,
    });

    const data = await apiRequest("/visitors", {
      method: "POST",
      body: { visitorId: "v-1" },
      visitorId: "v-1",
    });

    expect(data).toEqual({ visitorId: "v-1", isNew: false });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/visitors");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ visitor_id: "v-1" });
    expect(init.headers["X-Visitor-Id"]).toBe("v-1");
  });

  it("success가 false면 서버 오류 코드와 메시지로 ApiRequestError를 던진다", async () => {
    mockFetch(401, {
      success: false,
      data: null,
      error: { code: "VISITOR_REQUIRED", message: "방문자 등록이 필요합니다." },
    });

    const request = apiRequest("/scenarios");
    await expect(request).rejects.toBeInstanceOf(ApiRequestError);
    await expect(request).rejects.toMatchObject({
      status: 401,
      code: "VISITOR_REQUIRED",
      message: "방문자 등록이 필요합니다.",
    });
  });
});
