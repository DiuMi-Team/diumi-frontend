"use client";

import { BottomSheet } from "@/components/common/BottomSheet";
import { CloseIcon, MicIcon, SpeakerIcon } from "@/components/icons/ui-icons";
import type { VoiceErrorKind, VoiceStatus } from "@/features/voice/conversation";

type VoiceAssistantSheetProps = {
  open: boolean;
  onClose: () => void;
  onMicClick?: () => void;
  question?: string;
  answer?: string;
  /** AI와 연결된 상태. 없으면 예시 질문·답변만 보여 준다 */
  status?: VoiceStatus;
  errorKind?: VoiceErrorKind | null;
  /** 아직 묻지 않았을 때 보여 줄 질문 예시 */
  hint?: string;
  onRetry?: () => void;
};

const PROMPT: Record<VoiceStatus, string> = {
  connecting: "연결하고 있어요…",
  ready: "“무엇이 궁금하세요?”",
  listening: "듣고 있어요. 말씀해 주세요",
  thinking: "답변을 준비하고 있어요…",
  answering: "답변하고 있어요",
  error: "",
};

const ERROR_TEXT: Record<VoiceErrorKind, { title: string; detail: string }> = {
  "mic-denied": {
    title: "마이크를 쓸 수 없어요",
    detail: "브라우저 설정에서 마이크 사용을 허용하면 말로 물어볼 수 있어요.",
  },
  unavailable: {
    title: "지금은 AI 도우미에 연결할 수 없어요",
    detail: "잠시 후 다시 시도해 주세요.",
  },
};

export function VoiceAssistantSheet({
  open,
  onClose,
  onMicClick,
  question,
  answer,
  status,
  errorKind,
  hint,
  onRetry,
}: VoiceAssistantSheetProps) {
  const listening = status === "listening";
  const micDisabled = status === "connecting" || status === "error";
  const error = status === "error" ? ERROR_TEXT[errorKind ?? "unavailable"] : null;

  return (
    <BottomSheet open={open} onClose={onClose} label="AI 음성 도우미">
      <div className="flex items-center justify-between">
        <h2 className="text-22 font-bold">AI 음성 도우미</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex h-12 items-center gap-1.5 rounded-full border-2 border-text bg-white-pure px-5 text-18 font-bold"
        >
          <CloseIcon size={18} />
          닫기
        </button>
      </div>
      <div
        className={`flex size-28 flex-none items-center justify-center self-center rounded-full ${
          listening ? "bg-orange/50" : "bg-orange/25"
        } ${micDisabled ? "opacity-45" : ""}`}
      >
        <button
          type="button"
          aria-label={listening ? "듣기 멈추기" : "질문 말하기"}
          aria-pressed={status ? listening : undefined}
          disabled={micDisabled}
          onClick={onMicClick}
          className="flex size-21 items-center justify-center rounded-full bg-orange"
        >
          <MicIcon size={40} />
        </button>
      </div>
      {error ? (
        <div role="alert" className="flex flex-col items-center gap-1 text-center">
          <p className="text-20 leading-[1.3] font-bold">{error.title}</p>
          <p className="text-16 text-text-sub">{error.detail}</p>
          {onRetry && errorKind !== "mic-denied" && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 flex h-12 items-center rounded-full border-2 border-primary px-6 text-18 font-bold text-primary"
            >
              다시 연결하기
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 text-center" aria-live="polite">
          <p className="text-22 leading-[1.3] font-bold">{PROMPT[status ?? "ready"]}</p>
          {status === "ready" && !question && (
            <p className="text-16 text-text-sub">
              마이크를 누르고 말해 주세요
              {hint && (
                <>
                  <br />
                  예) {hint}
                </>
              )}
            </p>
          )}
        </div>
      )}
      {question && (
        <p className="max-w-[80%] self-end rounded-[22px_22px_6px_22px] bg-gray-1 px-[18px] py-3 text-18 leading-[1.4]">
          {question}
        </p>
      )}
      {answer && (
        <div className="flex flex-col gap-2 rounded-[22px_22px_22px_6px] bg-mint-light px-[18px] py-4">
          <p className="text-20 leading-[1.45] font-bold">{answer}</p>
          <p className="flex items-center gap-1.5 text-16 font-medium">
            <SpeakerIcon size={20} />
            음성 + 텍스트로 함께 답변
          </p>
        </div>
      )}
    </BottomSheet>
  );
}
