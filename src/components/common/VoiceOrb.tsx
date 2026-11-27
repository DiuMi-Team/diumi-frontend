import { MicIcon } from "@/components/icons/ui-icons";

type VoiceOrbProps = {
  /** 마이크로 듣는 중. 이때만 뒤 배경이 일렁인다 */
  listening: boolean;
  disabled?: boolean;
  onClick?: () => void;
  /** 듣는 중 상태를 화면 낭독기에 알릴 때 (AI와 연결된 시트) */
  pressed?: boolean;
  /** 위아래 여백. 기본은 AI 음성 도우미 시트처럼 -26px씩 겹친다 */
  marginClass?: string;
};

/**
 * 음성 도우미의 마이크 버튼 (Voice, XHelpVoice). 84px 주황 원은 고정이고,
 * 170px 자리 안에서 버튼 뒤의 빛 세 겹(halo·glow·core)만 일렁인다. 흰 테두리는 없다.
 * 자리가 버튼보다 커서 위아래로 -26px씩 겹쳐 둔다(시안 그대로).
 */
export function VoiceOrb({
  listening,
  disabled = false,
  onClick,
  pressed,
  marginClass = "-my-[26px]",
}: VoiceOrbProps) {
  return (
    <div
      className={`relative ${marginClass} flex size-[170px] flex-none items-center justify-center self-center ${
        listening ? "voice-orb-active" : ""
      } ${disabled ? "opacity-45" : ""}`}
    >
      <span aria-hidden="true" className="voice-orb-halo absolute inset-0 rounded-full" />
      <span aria-hidden="true" className="voice-orb-glow absolute inset-3.5 rounded-full" />
      <span aria-hidden="true" className="voice-orb-core absolute inset-[38px] rounded-full" />
      <button
        type="button"
        aria-label={listening ? "듣기 멈추기" : "질문 말하기"}
        aria-pressed={pressed}
        disabled={disabled}
        onClick={onClick}
        className="relative flex size-21 items-center justify-center rounded-full bg-orange"
      >
        <MicIcon size={40} />
      </button>
    </div>
  );
}
