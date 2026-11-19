/**
 * AI 음성 도우미 대화 상태.
 * OpenAI Realtime 서버 이벤트를 받아 화면에 보여 줄 상태·질문·답변을 만들고,
 * 질문과 답변 transcript가 둘 다 확정되면 저장할 한 턴(question·answer)을 돌려준다.
 * WebRTC와 떨어져 있어 브라우저 없이 테스트할 수 있다.
 */

export type VoiceStatus = "connecting" | "ready" | "listening" | "thinking" | "answering" | "error";

export type VoiceErrorKind = "mic-denied" | "unavailable";

export type VoiceView = {
  status: VoiceStatus;
  question: string;
  answer: string;
  errorKind: VoiceErrorKind | null;
};

export type CompletedTurn = {
  stepId: number;
  question: string;
  answer: string;
  responseTimeMs: number;
};

/** 서버 이벤트 중 여기서 쓰는 모양만 적는다 */
export type RealtimeServerEvent = {
  type: string;
  transcript?: string;
  delta?: string;
  session?: { audio?: { input?: { transcription?: unknown } } };
};

const ANSWER_DELTA = new Set([
  "response.output_audio_transcript.delta",
  "response.audio_transcript.delta", // 베타 이벤트 이름
]);
const ANSWER_DONE = new Set([
  "response.output_audio_transcript.done",
  "response.audio_transcript.done",
]);

/** 세션에 사용자 음성 받아쓰기가 꺼져 있으면 질문 transcript가 오지 않는다 */
export function needsInputTranscription(event: RealtimeServerEvent): boolean {
  return (
    (event.type === "session.created" || event.type === "session.updated") &&
    !event.session?.audio?.input?.transcription
  );
}

export class VoiceConversation {
  private view: VoiceView = { status: "connecting", question: "", answer: "", errorKind: null };
  private stepId = 0;
  private speechStoppedAt: number | null = null;
  private answerStartedAt: number | null = null;
  private finalQuestion: string | null = null;
  private finalAnswer: string | null = null;

  get snapshot(): VoiceView {
    return { ...this.view };
  }

  /** 연결이 끝났다 (session.created 전에도 마이크를 누를 수 있게) */
  connected(): void {
    if (this.view.status === "connecting") this.view.status = "ready";
  }

  fail(kind: VoiceErrorKind): void {
    this.view = { ...this.view, status: "error", errorKind: kind };
  }

  /** 다시 연결한다 */
  reconnecting(): void {
    this.view = { ...this.view, status: "connecting", errorKind: null };
  }

  /** 마이크 버튼을 눌렀다. 질문이 일어난 백엔드 단계를 기억한다 */
  startListening(stepId: number): void {
    this.stepId = stepId;
    this.view.status = "listening";
  }

  /** 말을 시작하지 않고 마이크를 껐다 */
  stopListening(): void {
    if (this.view.status === "listening") this.view.status = "ready";
  }

  /** 서버 이벤트를 반영한다. 질문·답변이 다 모이면 저장할 턴을 돌려준다 */
  handle(event: RealtimeServerEvent, now: number): CompletedTurn | null {
    switch (event.type) {
      case "session.created":
      case "session.updated":
        this.connected();
        return null;
      case "input_audio_buffer.speech_started":
        // 새 질문을 시작한다 (AI가 답하는 중이면 서버가 답을 끊는다)
        this.view = { ...this.view, status: "listening", question: "", answer: "" };
        this.speechStoppedAt = null;
        this.answerStartedAt = null;
        this.finalQuestion = null;
        this.finalAnswer = null;
        return null;
      case "input_audio_buffer.speech_stopped":
        this.speechStoppedAt = now;
        this.view.status = "thinking";
        return null;
      case "conversation.item.input_audio_transcription.completed":
        this.finalQuestion = (event.transcript ?? "").trim();
        this.view.question = this.finalQuestion;
        return this.takeTurn();
      case "response.done":
        if (this.view.status === "thinking" || this.view.status === "answering") {
          this.view.status = "ready";
        }
        return null;
    }
    if (ANSWER_DELTA.has(event.type)) {
      this.answerStartedAt ??= now;
      this.view.status = "answering";
      this.view.answer += event.delta ?? "";
      return null;
    }
    if (ANSWER_DONE.has(event.type)) {
      this.answerStartedAt ??= now;
      this.finalAnswer = (event.transcript ?? this.view.answer).trim();
      this.view.answer = this.finalAnswer;
      return this.takeTurn();
    }
    return null;
  }

  private takeTurn(): CompletedTurn | null {
    if (!this.finalQuestion || !this.finalAnswer) return null;
    const turn: CompletedTurn = {
      stepId: this.stepId,
      question: this.finalQuestion,
      answer: this.finalAnswer,
      responseTimeMs:
        this.speechStoppedAt !== null && this.answerStartedAt !== null
          ? Math.max(0, this.answerStartedAt - this.speechStoppedAt)
          : 0,
    };
    this.finalQuestion = null;
    this.finalAnswer = null;
    return turn;
  }
}
