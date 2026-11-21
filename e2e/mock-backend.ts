import type { Page } from "@playwright/test";

/**
 * e2e용 가짜 백엔드. 브라우저가 부르는 같은 주소의 /api/v1/* 요청에 백엔드 모양으로 답한다.
 * 결과 화면은 백엔드 판정만 쓰므로, 결과를 확인하는 테스트는 이걸로 수행 결과를 정해 준다.
 * AI 음성 연결은 실패(503)로 답한다.
 */

export type MockCondition = { condition: string; passed: boolean; detail?: string | null };

export type MockResult = {
  isSuccess: boolean;
  conditions: MockCondition[];
  conditionPassRate?: number;
  elapsedSeconds?: number;
  aiHelpCount?: number;
};

type SentAction = {
  step_id: number;
  action_type: string;
  target_code?: string;
  action_data?: unknown;
};

export async function mockBackend(page: Page, result: MockResult) {
  const actions: SentAction[] = [];
  const reply = (data: unknown, status = 200) => ({
    status,
    contentType: "application/json",
    body: JSON.stringify(
      status < 400
        ? { success: true, data, error: null }
        : { success: false, data: null, error: data },
    ),
  });

  await page.route("**/api/v1/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname.replace("/api/v1", "");
    if (path === "/visitors") {
      return route.fulfill(reply({ visitor_id: "e2e-visitor", is_new: true }, 201));
    }
    if (path === "/sessions" && request.method() === "POST") {
      return route.fulfill(
        reply({ session_id: "e2e-session", total_steps: 9, current_step: null }, 201),
      );
    }
    if (path.endsWith("/actions")) {
      actions.push(request.postDataJSON());
      return route.fulfill(reply({ action_id: actions.length, is_valid: true }, 201));
    }
    if (path.includes("/steps/")) return route.fulfill(reply({ is_last_step: false }, 201));
    if (path.endsWith("/end")) {
      return route.fulfill(reply({ status: "COMPLETED", result_available: true }));
    }
    if (path.endsWith("/result")) {
      const passed = result.conditions.filter((condition) => condition.passed).length;
      return route.fulfill(
        reply({
          session_id: "e2e-session",
          is_success: result.isSuccess,
          elapsed_seconds: result.elapsedSeconds ?? 42,
          ai_help_count: result.aiHelpCount ?? 0,
          error_count: 0,
          back_count: 0,
          conditions: result.conditions.map((condition, index) => ({
            code: `C${index}`,
            detail: null,
            ...condition,
          })),
          condition_pass_rate:
            result.conditionPassRate ?? Math.round((passed / result.conditions.length) * 100),
        }),
      );
    }
    if (path.includes("/ai/")) {
      return route.fulfill(
        reply({ code: "AI_CONNECTION_FAILED", message: "OpenAI 연결 실패" }, 503),
      );
    }
    return route.fulfill(reply({ code: "NOT_FOUND", message: "없는 요청" }, 404));
  });

  return { actions };
}
