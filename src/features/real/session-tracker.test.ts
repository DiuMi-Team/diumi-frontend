import { describe, expect, it, vi } from "vitest";
import type { StartedSession } from "@/features/api/session";
import { RealSessionTracker } from "@/features/real/session-tracker";
import { activeStepId, allStepIds, stepIdsBefore } from "@/features/real/steps";

describe("화면 진행 단계 → 백엔드 단계", () => {
  it("카페는 4단계로 묶는다", () => {
    expect(allStepIds("cafe")).toEqual([11, 12, 13, 14]);
    expect(stepIdsBefore("cafe", 2)).toEqual([]);
    expect(stepIdsBefore("cafe", 3)).toEqual([11]);
    expect(stepIdsBefore("cafe", 4)).toEqual([11, 12]);
    expect(stepIdsBefore("cafe", 6)).toEqual([11, 12]);
    expect(stepIdsBefore("cafe", 7)).toEqual([11, 12, 13]);
  });

  it("패스트푸드 사이드·음료 화면을 벗어나면 사이드·음료 단계를 함께 끝낸다", () => {
    expect(allStepIds("fastfood")).toEqual([21, 22, 23, 24, 25, 26]);
    expect(stepIdsBefore("fastfood", 4)).toEqual([21, 22]);
    expect(stepIdsBefore("fastfood", 5)).toEqual([21, 22, 23, 24]);
    expect(stepIdsBefore("fastfood", 8)).toEqual([21, 22, 23, 24, 25]);
  });

  it("아직 완료하지 않은 첫 단계를 현재 단계로 본다", () => {
    expect(activeStepId("cafe", new Set())).toBe(11);
    expect(activeStepId("cafe", new Set([11, 13]))).toBe(12);
    expect(activeStepId("cafe", new Set([11, 12, 13, 14]))).toBeNull();
  });
});

const SESSION: StartedSession = {
  sessionId: "s-1",
  visitorId: "v-1",
  totalSteps: 4,
  currentStep: null,
};

/** 호출 순서를 기록하는 가짜 API. 각 호출은 다음 틱에 끝난다 */
function fakeApi(options: { startFails?: boolean } = {}) {
  const calls: string[] = [];
  const later = <T>(value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value)));
  const api = {
    startSession: vi.fn(async () => {
      calls.push("start");
      if (options.startFails) throw new Error("down");
      return later(SESSION);
    }),
    completeStep: vi.fn(async (_s: unknown, stepId: number, elapsedMs: number) => {
      calls.push(`complete:${stepId}:${elapsedMs}`);
      return later({} as never);
    }),
    recordAction: vi.fn(async (_s: unknown, action: { stepId: number; actionType: string }) => {
      calls.push(`action:${action.actionType}:${action.stepId}`);
      return later({});
    }),
    endSession: vi.fn(async (_s: unknown, status: string) => {
      calls.push(`end:${status}`);
      return later({} as never);
    }),
    getSessionResult: vi.fn(async () => {
      calls.push("result");
      return later({
        sessionId: "s-1",
        isSuccess: null,
        elapsedSeconds: 83,
        aiHelpCount: 2,
        errorCount: null,
        backCount: 1,
      });
    }),
  };
  return { api, calls };
}

function clock(start = 1_000) {
  let now = start;
  return { now: () => now, advance: (ms: number) => (now += ms) };
}

describe("RealSessionTracker", () => {
  it("시작 응답 전 요청도 순서대로 보내고, 단계를 다 끝낸 뒤 COMPLETED → 결과 순으로 부른다", async () => {
    const { api, calls } = fakeApi();
    const time = clock();
    const tracker = new RealSessionTracker("cafe", 101, api, time.now);

    tracker.start();
    tracker.enterProgress(1);
    time.advance(5_000);
    tracker.recordAction("AI_HELP");
    time.advance(5_000);
    tracker.enterProgress(3); // 메뉴(11) 완료
    time.advance(2_000);
    tracker.recordAction("BACK"); // 옵션(12)에서 뒤로
    tracker.enterProgress(2); // 되돌아가도 다시 완료하지 않는다
    time.advance(3_000);
    tracker.enterProgress(5); // 옵션(12) 완료, 주문 확인(13) 진행 중
    const result = await tracker.complete();

    expect(calls).toEqual([
      "start",
      "action:AI_HELP:11",
      "complete:11:10000",
      "action:BACK:12",
      "complete:12:5000",
      "complete:13:0",
      "complete:14:0",
      "end:COMPLETED",
      "result",
    ]);
    expect(result).toMatchObject({ elapsedSeconds: 83, aiHelpCount: 2 });
    expect(api.startSession).toHaveBeenCalledWith({ service: "cafe", missionId: 101 });
  });

  it("중간에 그만두면 ABANDONED로 한 번만 끝내고, 이후 요청은 보내지 않는다", async () => {
    const { api, calls } = fakeApi();
    const tracker = new RealSessionTracker("fastfood", undefined, api);

    tracker.start();
    tracker.abandon(true); // 시작 응답 전
    tracker.abandon();
    tracker.recordAction("AI_HELP");
    tracker.enterProgress(5);
    await expect(tracker.complete()).resolves.toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(calls).toEqual(["start", "end:ABANDONED"]);
    expect(api.endSession).toHaveBeenCalledWith(SESSION, "ABANDONED", { keepalive: true });
  });

  it("시작하지 않았으면 아무것도 보내지 않는다 (미션 확인 화면에서 나간 경우)", async () => {
    const { api, calls } = fakeApi();
    const tracker = new RealSessionTracker("cafe", 101, api);

    tracker.enterProgress(1);
    tracker.abandon();
    await expect(tracker.complete()).resolves.toBeNull();
    expect(calls).toEqual([]);
  });

  it("시작에 실패하면 이후 요청을 건너뛰고 결과는 null이다", async () => {
    const { api, calls } = fakeApi({ startFails: true });
    const tracker = new RealSessionTracker("cafe", 101, api);

    tracker.start();
    tracker.enterProgress(3);
    await expect(tracker.complete()).resolves.toBeNull();
    expect(calls).toEqual(["start"]);
  });

  it("중간 요청이 실패해도 다음 요청은 보낸다", async () => {
    const { api, calls } = fakeApi();
    api.completeStep.mockImplementationOnce(async (_s: unknown, stepId: number) => {
      calls.push(`complete:${stepId}:fail`);
      throw new Error("409");
    });
    const tracker = new RealSessionTracker("cafe", 101, api);

    tracker.start();
    await expect(tracker.complete()).resolves.toMatchObject({ aiHelpCount: 2 });
    expect(calls).toEqual([
      "start",
      "complete:11:fail",
      "complete:12:0",
      "complete:13:0",
      "complete:14:0",
      "end:COMPLETED",
      "result",
    ]);
  });
});
