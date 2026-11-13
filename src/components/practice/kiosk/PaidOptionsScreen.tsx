"use client";

import type { ReactNode } from "react";
import { PaidOptionIcon } from "@/components/icons/kiosk-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import {
  groupDim,
  KIOSK_PRIMARY_CLASS,
  ScreenHeading,
  Spacer,
} from "@/components/practice/kiosk/parts";
import { PAID_OPTIONS, type PaidOption } from "@/features/cafe/catalog";
import { formatWon, itemPrice, paidOptionsPrice } from "@/features/order/order";

/** 유료 옵션 선택 (PA11, PA12) */
export function PaidOptionsScreen() {
  const { step, order } = usePractice();
  const draft = order.draft;
  if (draft?.type !== "drink") {
    throw new Error(`${step.id}: 옵션을 고를 음료가 없어요. 미션 데이터를 확인해 주세요`);
  }

  const extra = paidOptionsPrice(draft.paidOptions);

  return (
    <>
      <ScreenHeading title="유료 옵션을 선택해 주세요" sub="필요한 옵션만 추가해 주세요" />
      {PAID_OPTIONS.map((option) => (
        <PaidOptionRow key={option.id} option={option} count={draft.paidOptions[option.id] ?? 0} />
      ))}
      <div
        className={`flex flex-col gap-1.5 rounded-[18px] border-2 border-gray-1 px-4 py-3 text-16 short:gap-0.5 short:py-2 ${
          extra === 0 ? "opacity-45" : ""
        }`}
      >
        <div className="flex justify-between">
          <span>추가 금액</span>
          <b>{formatWon(extra)}</b>
        </div>
        <div className="flex justify-between text-18 font-bold">
          <span>음료 포함 금액</span>
          <span>{formatWon(itemPrice({ ...draft, quantity: 1 }))}</span>
        </div>
      </div>
      <Spacer />
      <KioskButton id="paidOptions:confirm" className={KIOSK_PRIMARY_CLASS}>
        유료 옵션 선택 완료
      </KioskButton>
    </>
  );
}

function PaidOptionRow({ option, count }: { option: PaidOption; count: number }) {
  const { step } = usePractice();
  const ids = [`paid:${option.id}:decrease`, `paid:${option.id}:increase`];
  const row = groupDim(step.target.id, ids);
  const selected = count > 0;
  /* 눌러야 할 곳이 없는 줄은 흐리게, 이미 고른 줄은 고른 항목 모양(흰 바탕·파란 테두리)으로 */
  const rowClass = row.groupClass
    ? selected
      ? "border-3 border-primary bg-white opacity-90"
      : "bg-gray-1 opacity-45"
    : "bg-gray-1";
  const stepperClass = selected && row.groupClass ? "bg-gray-1" : "bg-white";

  return (
    <div
      role="group"
      aria-label={`${option.name} ${count}개`}
      className={`flex h-16 items-center gap-3 rounded-[18px] pr-3 pl-3.5 text-18 font-bold short:h-14 ${rowClass}`}
    >
      <PaidOptionIcon option={option.id} size={36} />
      <span className={`flex flex-1 flex-col leading-[1.25] ${selected ? "text-primary" : ""}`}>
        {option.name}
        <span className={`text-16 font-medium ${selected ? "" : "text-text-sub"}`}>
          +{formatWon(option.price)}
        </span>
      </span>
      <span className="flex items-center gap-2.5">
        <StepperButton
          id={ids[0]}
          label={`${option.name} 빼기`}
          inactive={row.itemInactiveClass}
          className={stepperClass}
        >
          −
        </StepperButton>
        <b className={`min-w-4 text-center ${selected ? "text-primary" : ""}`}>{count}</b>
        <StepperButton
          id={ids[1]}
          label={`${option.name} 더하기`}
          inactive={row.itemInactiveClass}
          className={stepperClass}
        >
          ＋
        </StepperButton>
      </span>
    </div>
  );
}

/** 보이는 크기는 디자인의 38px이고, 터치 영역만 48px 이상으로 넓힌다 */
function StepperButton({
  id,
  label,
  inactive,
  className,
  children,
}: {
  id: string;
  label: string;
  inactive: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <KioskButton
      id={id}
      tight
      ariaLabel={label}
      inactiveClassName={inactive}
      className={`relative flex size-[38px] items-center justify-center rounded-full text-22 text-primary after:absolute after:-inset-1.5 ${className}`}
    >
      {children}
    </KioskButton>
  );
}
