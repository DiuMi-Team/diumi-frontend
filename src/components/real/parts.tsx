import type { ReactNode } from "react";
import { KIOSK_OUTLINE_CLASS, KIOSK_PRIMARY_CLASS } from "@/components/practice/kiosk/parts";

/* 실전모드 화면이 함께 쓰는 모양. 강조·흐림 없이 모든 칸을 누를 수 있다 */

/**
 * 주 버튼은 본문 아래에 붙어 있다. 키 작은 화면에서 내용이 넘쳐도 다음으로 가는 버튼이 늘 보이게 하고,
 * 위로 흰 그림자를 둬서 지나가는 내용과 겹쳐 보이지 않게 한다. 넘치지 않으면 원래 자리와 같다.
 */
export const REAL_PRIMARY_CLASS = `${KIOSK_PRIMARY_CLASS} sticky bottom-0 z-10 shadow-[0_-12px_12px_-4px_var(--color-white)]`;
export const REAL_OUTLINE_CLASS = KIOSK_OUTLINE_CLASS;

const TILE_BASE = "flex items-center justify-center rounded-[18px] font-bold";
const SELECTED = "border-3 border-primary bg-white text-primary";
const UNSELECTED = "bg-gray-1";

type SelectTileProps = {
  selected: boolean;
  onClick: () => void;
  className: string;
  ariaLabel?: string;
  children: ReactNode;
};

/** 하나를 고르는 칸 (온도, 사이즈, 무료 옵션 등). 고르면 흰 바탕·파란 테두리 */
export function SelectTile({ selected, onClick, className, ariaLabel, children }: SelectTileProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`${TILE_BASE} ${selected ? SELECTED : UNSELECTED} ${className}`}
    >
      {children}
    </button>
  );
}

export function OptionLabel({ children }: { children: ReactNode }) {
  return <span className="text-16 font-bold text-text-sub short:leading-5">{children}</span>;
}

type StepperProps = {
  value: number;
  unit?: string;
  label: string;
  min?: number;
  onChange: (value: number) => void;
  /** 버튼 바탕. 회색 칸 안에서는 흰색 */
  buttonClass?: string;
};

/** − 숫자 ＋. 보이는 버튼은 40px이고 터치 영역만 48px로 넓힌다 */
export function Stepper({
  value,
  unit = "",
  label,
  min = 1,
  onChange,
  buttonClass = "bg-white",
}: StepperProps) {
  const button = `relative flex size-10 items-center justify-center rounded-full text-24 text-primary after:absolute after:-inset-1 disabled:opacity-45 ${buttonClass}`;
  return (
    <span className="flex items-center gap-3">
      <button
        type="button"
        aria-label={`${label} 빼기`}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={button}
      >
        −
      </button>
      <b className="min-w-5 text-center text-20" aria-live="polite">
        {value}
        {unit}
      </b>
      <button
        type="button"
        aria-label={`${label} 더하기`}
        onClick={() => onChange(value + 1)}
        className={button}
      >
        ＋
      </button>
    </span>
  );
}
