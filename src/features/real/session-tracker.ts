import * as aiApi from "@/features/api/ai";
import type { AiConnection, AiTurn } from "@/features/api/ai";
import * as sessionApi from "@/features/api/session";
import type { SessionEndStatus, SessionResult, StartedSession } from "@/features/api/session";
import type { PracticeService } from "@/features/practice/types";
import type { BackendAction } from "@/features/real/actions";
import { activeStepId, allStepIds, stepIdForProgress, stepIdsBefore } from "@/features/real/steps";

type SessionApi = Pick<
  typeof sessionApi,
  "startSession" | "endSession" | "completeStep" | "recordAction" | "getSessionResult"
> &
  Pick<typeof aiApi, "startAiConnection" | "saveAiMessages">;

const DEFAULT_API: SessionApi = { ...sessionApi, ...aiApi };

/**
 * 실전 체험 세션 하나를 백엔드에 기록한다.
 *
 * - 요청은 보낸 순서대로 하나씩 보낸다. 단계 완료가 끝나야 COMPLETED 종료를 받아 주고,
 *   종료가 끝나야 결과가 생기기 때문이다.
 * - 시작 응답이 오기 전에 들어온 요청도 줄을 서 있다가 시작 뒤에 나간다.
 * - 요청이 실패해도 화면은 그대로 진행한다. 실패한 요청은 버리고 다음 요청을 보낸다.
 */
export class RealSessionTracker {
  private session: StartedSession | null = null;
  private started = false;
  private ended: SessionEndStatus | null = null;
  private paid = false;
  private queue: Promise<unknown> = Promise.resolve();
  private readonly completed = new Set<number>();
  /** 지금 단계를 시작한 시각 (앞 단계를 완료한 시각) */
  private stepStartedAt = 0;
  /** 세션을 시작한 시각. 결과 화면의 소요 시간(프론트 값)을 잴 때도 쓴다 */
  startedAt = 0;

  constructor(
    private readonly service: PracticeService,
    private readonly missionId: number | undefined,
    private readonly api: SessionApi = DEFAULT_API,
    private readonly now: () => number = Date.now,
  ) {}

  /** 백엔드 세션 ID. 시작 응답 전이나 실패하면 null */
  get sessionId(): string | null {
    return this.session?.sessionId ?? null;
  }

  get isEnded(): boolean {
    return this.ended !== null;
  }

  /** 지금 진행 중인 백엔드 단계 (모두 끝났으면 마지막 단계) */
  get currentStepId(): number {
    const all = allStepIds(this.service);
    return activeStepId(this.service, this.completed) ?? all[all.length - 1];
  }

  /**
   * AI 음성 연결용 임시 키를 받는다. 세션이 없거나 끝났거나 실패하면 null.
   * 백엔드는 연결 횟수를 도움 요청 횟수(ai_help_count)로 센다.
   */
  connectAi(screenCode?: string): Promise<AiConnection | null> {
    if (!this.started || this.ended) return Promise.resolve(null);
    const stepId = this.currentStepId;
    return this.enqueue((session) => this.api.startAiConnection(session, { stepId, screenCode }));
  }

  /** 확정된 질문·답변을 저장한다. 세션이 끝난 뒤에도 저장할 수 있다 */
  saveAiTurn(turn: AiTurn): void {
    if (!this.started) return;
    this.enqueue((session) => this.api.saveAiMessages(session, turn));
  }

  /** 한 번만 시작한다 */
  start(): void {
    if (this.started) return;
    this.started = true;
    this.startedAt = this.stepStartedAt = this.now();
    this.queue = this.api
      .startSession({ service: this.service, missionId: this.missionId })
      .then((session) => {
        this.session = session;
      })
      .catch(() => {});
  }

  /** 화면 진행 단계(1~9)에 들어왔다. 이미 지나온 백엔드 단계를 완료한다 */
  enterProgress(progress: number): void {
    if (!this.started || this.ended) return;
    this.completeSteps(stepIdsBefore(this.service, progress));
  }

  /**
   * 행동을 기록한다. 행동이 일어난 화면의 진행 단계(1~9)로 백엔드 단계를 정한다.
   * 지난 화면으로 돌아가 다시 고른 행동도 그 화면의 단계로 기록된다.
   */
  record(progress: number, action: BackendAction): void {
    if (!this.started || this.ended) return;
    const stepId = stepIdForProgress(this.service, progress);
    const occurredAt = this.now();
    this.enqueue((session) => this.api.recordAction(session, { stepId, occurredAt, ...action }));
  }

  /** 결제를 마쳤다. 이제 화면을 떠나도 중도 포기가 아니라 완료로 끝낸다 */
  markPaid(): void {
    this.paid = true;
  }

  /** 끝까지 마쳤다. 남은 단계를 완료하고 COMPLETED로 끝낸 뒤 수행 결과를 돌려준다 */
  complete(): Promise<SessionResult | null> {
    if (!this.started || this.ended) return Promise.resolve(null);
    this.completeSteps(allStepIds(this.service));
    this.ended = "COMPLETED";
    this.enqueue((session) => this.api.endSession(session, "COMPLETED"));
    return this.enqueue((session) => this.api.getSessionResult(session));
  }

  /**
   * 중간에 그만뒀다. 순서를 기다릴 필요가 없어 바로 보낸다 (탭을 닫을 때는 keepalive).
   * 결제를 마친 뒤 떠난 경우(결제 완료 화면에서 나감)는 완료로 끝낸다.
   */
  abandon(keepalive = false): void {
    if (!this.started || this.ended) return;
    if (this.paid) {
      this.complete();
      return;
    }
    this.ended = "ABANDONED";
    const send = (session: StartedSession) =>
      this.api.endSession(session, "ABANDONED", { keepalive }).catch(() => {});
    if (this.session) send(this.session);
    else this.queue.then(() => this.session && send(this.session));
  }

  private completeSteps(stepIds: number[]): void {
    for (const stepId of stepIds) {
      if (this.completed.has(stepId)) continue;
      this.completed.add(stepId);
      const now = this.now();
      const elapsedMs = now - this.stepStartedAt;
      this.stepStartedAt = now;
      this.enqueue((session) => this.api.completeStep(session, stepId, elapsedMs));
    }
  }

  private enqueue<T>(send: (session: StartedSession) => Promise<T>): Promise<T | null> {
    const next = this.queue
      .then(() => (this.session ? send(this.session) : null))
      .catch(() => null);
    this.queue = next;
    return next;
  }
}
