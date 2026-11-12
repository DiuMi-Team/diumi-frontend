"use client";

import { createContext, use, type ReactNode } from "react";
import type { OrderState } from "@/features/order/order";
import type { PracticeMission, PracticeStep } from "@/features/practice/types";

type PracticeContextValue = {
  mission: PracticeMission;
  step: PracticeStep;
  /** 이 화면에 들어왔을 때의 주문 상태 */
  order: OrderState;
  /** 화면 안의 칸을 눌렀다. 눌러야 할 곳이면 다음으로, 아니면 빨간 안내 */
  tap: (targetId: string) => void;
};

const PracticeContext = createContext<PracticeContextValue | null>(null);

export function PracticeProvider({
  value,
  children,
}: {
  value: PracticeContextValue;
  children: ReactNode;
}) {
  return <PracticeContext value={value}>{children}</PracticeContext>;
}

export function usePractice(): PracticeContextValue {
  const value = use(PracticeContext);
  if (!value) throw new Error("usePractice는 PracticeProvider 안에서만 쓸 수 있어요");
  return value;
}

type KioskButtonProps = {
  /** 미션 데이터의 target.id와 맞춘다. 예: "menu:americano" */
  id: string;
  className: string;
  /** 메뉴판 칸·옵션 칸처럼 촘촘한 곳은 강조 간격이 2px */
  tight?: boolean;
  /**
   * 눌러야 할 곳이 아닐 때 붙는 클래스. 기본은 흐리게(.45).
   * 이미 고른 항목은 "opacity-90", 묶음째 흐려진 영역 안에서는 "".
   */
  inactiveClassName?: string;
  pressed?: boolean;
  ariaLabel?: string;
  children: ReactNode;
};

/**
 * 연습모드 키오스크 화면의 누를 수 있는 칸.
 * 눌러야 할 곳이면 주황 강조, 아니면 흐리게 보이고 눌러도 선택은 바뀌지 않는다(빨간 안내만 뜬다).
 */
export function KioskButton({
  id,
  className,
  tight = false,
  inactiveClassName = "opacity-45",
  pressed,
  ariaLabel,
  children,
}: KioskButtonProps) {
  const { step, tap } = usePractice();
  const isTarget = step.target.id === id;
  const stateClass = isTarget
    ? `practice-target ${tight ? "practice-target-tight" : ""}`
    : inactiveClassName;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={pressed}
      aria-disabled={isTarget ? undefined : true}
      data-practice-target={isTarget ? "" : undefined}
      onClick={() => tap(id)}
      className={`${className} ${stateClass}`}
    >
      {children}
    </button>
  );
}
