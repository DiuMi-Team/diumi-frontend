"use client";

import { useEffect, useRef, useState } from "react";
import { BottomSheet } from "@/components/common/BottomSheet";
import { VoiceOrb } from "@/components/common/VoiceOrb";
import { CloseIcon, MicIcon, SpeakerIcon } from "@/components/icons/ui-icons";

/** 예시 질문과 미리 정해 둔 답. 연습용이라 AI에 연결하지 않는다 */
const EXAMPLES = [
  { question: "카드는 어디에 넣나요?", answer: "카드는 화면 아래쪽 투입구에 넣어 주세요." },
  { question: "포장은 어떻게 해요?", answer: "첫 화면에서 ‘포장해서 갈래요’를 누르면 돼요." },
  {
    question: "주문을 취소하고 싶어요",
    answer: "위쪽의 ‘처음으로’를 누르면 주문을 멈추고 첫 화면으로 돌아가요.",
  },
] as const;

type Example = (typeof EXAMPLES)[number];

/** 마이크를 누르고 이 시간이 지나면 듣기를 멈춘다 */
const LISTEN_MS = 8_000;

/** 답을 소리로도 읽어 준다. 음성 합성을 못 쓰는 브라우저에서는 글자로만 보여 준다 */
function speak(text: string) {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ko-KR";
    synth.speak(utterance);
  } catch {
    /* 소리 없이 글자만 보여 준다 */
  }
}

function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* 무시 */
  }
}

/**
 * 도움말의 음성 도우미 테스트 (XHelp, XHelpVoice).
 * 주문과 상관없이 마이크 버튼과 질문·답변 모양을 미리 써 보는 연습이다. 실제 주문·AI와 연결하지 않고,
 * 예시 질문을 누르면 정해 둔 답을 글자와 소리로 보여 준다. 닫으면 도움말로 돌아간다.
 */
export function VoiceTestSection() {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [asked, setAsked] = useState<Example | null>(null);
  const listenTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const stopListening = () => {
    clearTimeout(listenTimer.current);
    setListening(false);
  };

  const close = () => {
    stopListening();
    stopSpeaking();
    setAsked(null);
    setOpen(false);
  };

  useEffect(() => () => clearTimeout(listenTimer.current), []);

  const toggleMic = () => {
    if (listening) return stopListening();
    stopSpeaking();
    setListening(true);
    clearTimeout(listenTimer.current);
    listenTimer.current = setTimeout(() => setListening(false), LISTEN_MS);
  };

  const ask = (example: Example) => {
    stopListening();
    setAsked(example);
    speak(example.answer);
  };

  return (
    <>
      <p className="-mb-1 text-center text-16 font-bold">지금 이 버튼으로 연습해 보세요</p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-[60px] items-center justify-center gap-2.5 rounded-full bg-orange text-19 font-bold short:h-14"
      >
        <span className="flex size-[38px] items-center justify-center rounded-full bg-white-pure">
          <MicIcon size={22} />
        </span>
        음성 도우미 테스트해 보기
      </button>

      <BottomSheet open={open} onClose={close} label="음성 도우미 테스트" heightClass="h-[660px]">
        <div className="flex items-center justify-between gap-2">
          <span className="flex flex-col">
            <h2 className="text-22 font-bold">음성 도우미 테스트</h2>
            <span className="text-16 text-text-sub">편하게 말해 보세요. 연습이에요.</span>
          </span>
          <button
            type="button"
            onClick={close}
            className="flex h-12 flex-none items-center gap-1.5 rounded-full border-2 border-text bg-white-pure px-5 text-18 font-bold"
          >
            <CloseIcon size={18} />
            닫기
          </button>
        </div>
        <div className="-mt-[18px] flex flex-col items-center">
          <VoiceOrb listening={listening} pressed={listening} onClick={toggleMic} marginClass="" />
          <p aria-live="polite" className="-mt-[18px] text-20 font-bold">
            {listening ? "듣고 있어요…" : "“무엇이 궁금하세요?”"}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-16 font-bold text-text-sub">이렇게 말해 보세요</span>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example.question}
                type="button"
                onClick={() => ask(example)}
                className="relative h-10 rounded-full border-2 border-gray-2 bg-white-pure px-3.5 text-16 font-semibold after:absolute after:-inset-y-1 after:inset-x-0"
              >
                “{example.question}”
              </button>
            ))}
          </div>
        </div>
        {asked && (
          <>
            <p className="max-w-[80%] self-end rounded-[20px_20px_6px_20px] bg-gray-1 px-4 py-2.5 text-17 leading-[1.4]">
              {asked.question}
            </p>
            <div className="flex flex-col gap-1.5 rounded-[22px_22px_22px_6px] bg-mint-light px-[18px] py-3.5">
              <p aria-live="polite" className="text-19 leading-[1.45] font-bold">
                {asked.answer}
              </p>
              <p className="flex items-center gap-1.5 text-16 font-medium">
                <SpeakerIcon size={18} />
                소리로도 들려 드려요
              </p>
            </div>
          </>
        )}
      </BottomSheet>
    </>
  );
}
