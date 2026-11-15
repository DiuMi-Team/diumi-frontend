"use client";

import { createContext, use, type ReactNode } from "react";
import type { OrderAction, OrderState } from "@/features/order/order";
import type { RealScreen } from "@/features/real/flow";
import type { RealMission } from "@/features/real/missions";

type RealContextValue = {
  mission: RealMission;
  order: OrderState;
  /** 주문 상태를 바꾸고 행동 기록에 남긴다 */
  act: (action: OrderAction, target: string) => void;
  /** 다른 화면으로 간다 (이전으로를 누르면 돌아온다) */
  go: (screen: RealScreen) => void;
  /** 이전 화면으로 돌아간다 (유료·무료 옵션을 다 고르고 옵션 화면으로 돌아갈 때) */
  back: () => void;
  /** 결제처럼 아직 만들지 않은 다음 단계 */
  comingSoon: () => void;
};

const RealContext = createContext<RealContextValue | null>(null);

export function RealProvider({
  value,
  children,
}: {
  value: RealContextValue;
  children: ReactNode;
}) {
  return <RealContext value={value}>{children}</RealContext>;
}

export function useReal(): RealContextValue {
  const value = use(RealContext);
  if (!value) throw new Error("useReal은 RealProvider 안에서만 쓸 수 있어요");
  return value;
}
