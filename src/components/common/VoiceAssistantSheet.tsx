"use client";

import { BottomSheet } from "@/components/common/BottomSheet";
import { CloseIcon, MicIcon, SpeakerIcon } from "@/components/icons/ui-icons";

type VoiceAssistantSheetProps = {
  open: boolean;
  onClose: () => void;
  onMicClick?: () => void;
  question?: string;
  answer?: string;
};

export function VoiceAssistantSheet({
  open,
  onClose,
  onMicClick,
  question,
  answer,
}: VoiceAssistantSheetProps) {
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
      <div className="flex size-28 flex-none items-center justify-center self-center rounded-full bg-orange/25">
        <button
          type="button"
          aria-label="질문 말하기"
          onClick={onMicClick}
          className="flex size-21 items-center justify-center rounded-full bg-orange"
        >
          <MicIcon size={40} />
        </button>
      </div>
      <p className="text-center text-22 leading-[1.3] font-bold">“무엇이 궁금하세요?”</p>
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
