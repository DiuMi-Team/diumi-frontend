"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { RealSessionTracker } from "@/features/real/session-tracker";
import {
  needsInputTranscription,
  VoiceConversation,
  type VoiceView,
} from "@/features/voice/conversation";
import {
  connectRealtime,
  ENABLE_INPUT_TRANSCRIPTION,
  MicPermissionError,
  type RealtimeLink,
} from "@/features/voice/realtime";

/** 마이크를 눌렀는데 이 시간 동안 말이 없으면 마이크를 끈다 */
const LISTEN_TIMEOUT_MS = 10_000;

/**
 * 실전 AI 음성 도우미. 시트가 열려 있는 동안만 OpenAI Realtime에 연결한다.
 * - 열면: 백엔드에서 임시 키를 받아 WebRTC 연결 (마이크는 꺼 둔다)
 * - 마이크 버튼: 누르면 듣기 시작, 말이 끝나면(서버 음성 감지) 마이크를 끄고 답을 기다린다
 * - 질문·답변이 확정되면 백엔드에 저장
 * - 닫거나 화면을 떠나면 연결 종료
 */
export function useRealVoice(
  tracker: RefObject<RealSessionTracker>,
  open: boolean,
  /** 연결할 때의 화면 코드. 시트가 열려 있는 동안은 화면이 바뀌지 않는다 */
  screenCode: string,
) {
  const screenCodeRef = useRef(screenCode);
  useEffect(() => {
    screenCodeRef.current = screenCode;
  }, [screenCode]);
  const [view, setView] = useState<VoiceView>(() => new VoiceConversation().snapshot);
  const [attempt, setAttempt] = useState(0);
  const conversation = useRef<VoiceConversation | null>(null);
  const link = useRef<RealtimeLink | null>(null);
  const listenTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const current = new VoiceConversation();
    conversation.current = current;
    const sync = () => {
      if (!cancelled) setView(current.snapshot);
    };
    sync();

    const connect = async () => {
      const connection = await tracker.current.connectAi(screenCodeRef.current);
      if (cancelled) return;
      if (!connection) {
        current.fail("unavailable");
        return sync();
      }
      try {
        const opened = await connectRealtime({
          clientSecret: connection.clientSecret,
          onEvent: (event) => {
            if (needsInputTranscription(event)) link.current?.send(ENABLE_INPUT_TRANSCRIPTION);
            if (event.type === "input_audio_buffer.speech_started") {
              clearTimeout(listenTimer.current);
            }
            if (event.type === "input_audio_buffer.speech_stopped") {
              link.current?.setMicEnabled(false);
            }
            const turn = current.handle(event, Date.now());
            if (turn) tracker.current.saveAiTurn(turn);
            sync();
          },
          onDisconnect: () => {
            link.current = null;
            current.fail("unavailable");
            sync();
          },
        });
        if (cancelled) {
          opened.close();
          return;
        }
        link.current = opened;
        current.connected();
      } catch (error) {
        if (cancelled) return;
        current.fail(error instanceof MicPermissionError ? "mic-denied" : "unavailable");
      }
      sync();
    };
    connect();

    return () => {
      cancelled = true;
      clearTimeout(listenTimer.current);
      link.current?.close();
      link.current = null;
      conversation.current = null;
    };
  }, [open, attempt, tracker]);

  const onMicClick = useCallback(() => {
    const current = conversation.current;
    const opened = link.current;
    if (!current || !opened) return;
    opened.unlockAudio();
    if (current.snapshot.status === "listening") {
      opened.setMicEnabled(false);
      current.stopListening();
      clearTimeout(listenTimer.current);
    } else if (current.snapshot.status !== "connecting" && current.snapshot.status !== "error") {
      current.startListening(tracker.current.currentStepId);
      opened.setMicEnabled(true);
      clearTimeout(listenTimer.current);
      listenTimer.current = setTimeout(() => {
        if (current.snapshot.status !== "listening") return;
        opened.setMicEnabled(false);
        current.stopListening();
        setView(current.snapshot);
      }, LISTEN_TIMEOUT_MS);
    }
    setView(current.snapshot);
  }, [tracker]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);

  return { ...view, onMicClick, retry };
}
