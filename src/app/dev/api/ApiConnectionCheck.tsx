"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Header, HeaderChip } from "@/components/common/Header";
import { NavBar } from "@/components/common/NavBar";
import { API_BASE_PATH, ApiRequestError } from "@/features/api/client";
import { getScenarios, type ScenarioSummary } from "@/features/api/scenarios";
import { ensureVisitor, type Visitor } from "@/features/api/visitor";

type CheckState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; visitor: Visitor; scenarios: ScenarioSummary[]; ms: number }
  | { status: "error"; step: string; message: string };

function describe(error: unknown) {
  if (error instanceof ApiRequestError) return `${error.status} ${error.code}: ${error.message}`;
  return error instanceof Error ? error.message : String(error);
}

/** 백엔드 연결 확인. 방문자 등록 → 시나리오 목록 조회를 차례로 불러 본다 */
export function ApiConnectionCheck() {
  const [state, setState] = useState<CheckState>({ status: "idle" });

  const check = async () => {
    setState({ status: "loading" });
    const startedAt = performance.now();
    let step = "방문자 등록 (POST /visitors)";
    try {
      const visitor = await ensureVisitor();
      step = "시나리오 목록 (GET /scenarios)";
      const scenarios = await getScenarios(visitor.visitorId);
      setState({
        status: "success",
        visitor,
        scenarios,
        ms: Math.round(performance.now() - startedAt),
      });
    } catch (error) {
      setState({ status: "error", step, message: describe(error) });
    }
  };

  return (
    <>
      <Header right={<HeaderChip compact>개발 · API</HeaderChip>} />
      <NavBar back="/" />
      <main className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 pt-3.5 pb-4 *:shrink-0">
        <h1 className="text-21 font-bold">백엔드 연결 확인</h1>
        <p className="text-16 text-text-sub">
          {API_BASE_PATH} 로 방문자 등록과 시나리오 목록 조회를 불러 봅니다.
        </p>
        <Button onClick={check} disabled={state.status === "loading"}>
          {state.status === "loading" ? "확인 중…" : "연결 확인"}
        </Button>

        {state.status === "success" && (
          <section aria-label="연결 결과" className="flex flex-col gap-2 text-16">
            <p className="font-bold text-primary">연결 성공 ({state.ms}ms)</p>
            <p>
              방문자: {state.visitor.visitorId} ({state.visitor.isNew ? "새 방문자" : "재방문"})
            </p>
            <ul className="flex flex-col gap-1">
              {state.scenarios.map((scenario) => (
                <li key={scenario.scenarioId}>
                  #{scenario.scenarioId} {scenario.title} ({scenario.scenarioType}) ·{" "}
                  {scenario.description}
                </li>
              ))}
            </ul>
          </section>
        )}
        {state.status === "error" && (
          <section aria-label="연결 결과" role="alert" className="flex flex-col gap-1 text-16">
            <p className="font-bold text-error-text">연결 실패 · {state.step}</p>
            <p>{state.message}</p>
          </section>
        )}
      </main>
    </>
  );
}
