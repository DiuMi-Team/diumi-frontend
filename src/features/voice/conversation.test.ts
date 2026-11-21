import { describe, expect, it } from "vitest";
import { needsInputTranscription, VoiceConversation } from "@/features/voice/conversation";

describe("VoiceConversation", () => {
  it("연결 → 듣기 → 답변 준비 → 답변 → 다시 대기로 상태가 바뀐다", () => {
    const voice = new VoiceConversation();
    expect(voice.snapshot.status).toBe("connecting");

    voice.handle({ type: "session.created" }, 0);
    expect(voice.snapshot.status).toBe("ready");

    voice.startListening(12);
    expect(voice.snapshot.status).toBe("listening");
    voice.handle({ type: "input_audio_buffer.speech_started" }, 1_000);
    voice.handle({ type: "input_audio_buffer.speech_stopped" }, 3_000);
    expect(voice.snapshot.status).toBe("thinking");

    voice.handle({ type: "response.output_audio_transcript.delta", delta: "커피 " }, 3_800);
    voice.handle({ type: "response.output_audio_transcript.delta", delta: "탭에 있어요" }, 3_900);
    expect(voice.snapshot).toMatchObject({ status: "answering", answer: "커피 탭에 있어요" });

    voice.handle({ type: "response.done" }, 5_000);
    expect(voice.snapshot.status).toBe("ready");
  });

  it("질문·답변 transcript가 둘 다 확정되면 응답 시간과 함께 한 턴을 돌려준다 (순서와 무관)", () => {
    const voice = new VoiceConversation();
    voice.connected();
    voice.startListening(21);
    voice.handle({ type: "input_audio_buffer.speech_started" }, 1_000);
    voice.handle({ type: "input_audio_buffer.speech_stopped" }, 2_000);
    voice.handle({ type: "response.output_audio_transcript.delta", delta: "세트" }, 2_600);

    // 답변이 먼저 확정되고, 질문 받아쓰기가 나중에 온다
    expect(
      voice.handle(
        { type: "response.output_audio_transcript.done", transcript: " 세트를 누르세요. " },
        3_000,
      ),
    ).toBeNull();
    const turn = voice.handle(
      {
        type: "conversation.item.input_audio_transcription.completed",
        transcript: "세트는 어디서 골라요? ",
      },
      3_200,
    );

    expect(turn).toEqual({
      stepId: 21,
      question: "세트는 어디서 골라요?",
      answer: "세트를 누르세요.",
      responseTimeMs: 600,
    });
    expect(voice.snapshot).toMatchObject({
      question: "세트는 어디서 골라요?",
      answer: "세트를 누르세요.",
    });
  });

  it("새로 말하기 시작하면 이전 질문·답변을 지운다", () => {
    const voice = new VoiceConversation();
    voice.connected();
    voice.handle(
      { type: "conversation.item.input_audio_transcription.completed", transcript: "앞 질문" },
      0,
    );
    voice.handle({ type: "response.audio_transcript.done", transcript: "앞 답변" }, 0);
    voice.handle({ type: "input_audio_buffer.speech_started" }, 10);
    expect(voice.snapshot).toMatchObject({ status: "listening", question: "", answer: "" });
  });

  it("말하지 않고 마이크를 끄면 대기로, 실패하면 오류 종류를 남긴다", () => {
    const voice = new VoiceConversation();
    voice.connected();
    voice.startListening(11);
    voice.stopListening();
    expect(voice.snapshot.status).toBe("ready");

    voice.fail("mic-denied");
    expect(voice.snapshot).toMatchObject({ status: "error", errorKind: "mic-denied" });
    voice.reconnecting();
    expect(voice.snapshot).toMatchObject({ status: "connecting", errorKind: null });
  });

  it("세션에 사용자 음성 받아쓰기가 꺼져 있는지 알아낸다", () => {
    expect(needsInputTranscription({ type: "session.created", session: {} })).toBe(true);
    expect(
      needsInputTranscription({
        type: "session.created",
        session: { audio: { input: { transcription: { model: "gpt-4o-mini-transcribe" } } } },
      }),
    ).toBe(false);
    expect(needsInputTranscription({ type: "response.done" })).toBe(false);
  });
});
