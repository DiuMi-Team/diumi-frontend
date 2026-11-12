import type { ReactNode } from "react";

function ProgressBars({
  current,
  total,
  label,
  gapClass,
}: {
  current: number;
  total: number;
  label: string;
  gapClass: string;
}) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={current}
      className={`flex ${gapClass}`}
    >
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`h-2 flex-1 rounded-sm ${index < current ? "bg-primary" : "bg-gray-2"}`}
        />
      ))}
    </div>
  );
}

type PracticeProgressProps = {
  step: number;
  /** 미션마다 다르다. 기본·쿠폰 미션은 3단계, 옵션 포함 미션은 4단계 */
  total: number;
  /** 단계 설명. 예: "아메리카노 2잔 담기 (2/5)" */
  detail?: ReactNode;
};

export function PracticeProgress({ step, total, detail }: PracticeProgressProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="text-16 font-bold">
        {step}단계 / 총 {total}단계{" "}
        {detail && <span className="font-medium text-text-sub">· {detail}</span>}
      </div>
      <ProgressBars current={step} total={total} label="연습 진행 단계" gapClass="gap-1.5" />
    </div>
  );
}

const MISSION_TOTAL_STEPS = 9;

type MissionProgressProps = {
  step: number;
  label: string;
};

export function MissionProgress({ step, label }: MissionProgressProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-16 font-bold">
        <span>{label}</span>
        <span className="text-text-sub">
          {step} / {MISSION_TOTAL_STEPS}
        </span>
      </div>
      <ProgressBars
        current={step}
        total={MISSION_TOTAL_STEPS}
        label="미션 진행 단계"
        gapClass="gap-1"
      />
    </div>
  );
}
