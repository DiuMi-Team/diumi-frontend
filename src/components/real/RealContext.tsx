"use client";

import { createContext, use, type ReactNode } from "react";
import type { OrderAction, OrderState } from "@/features/order/order";
import type { RealScreen } from "@/features/real/flow";
import type { RealSetup } from "@/features/real/missions";

type RealContextValue = {
  /** 미션 수행이면 setup.mission이 있고, 자유 체험이면 null이다 */
  setup: RealSetup;
  order: OrderState;
  /** 주문 상태를 바꾸고 행동 기록에 남긴다 */
  act: (action: OrderAction, target: string) => void;
  /** 다른 화면으로 간다 (이전으로를 누르면 돌아온다) */
  go: (screen: RealScreen) => void;
  /** 이전 화면으로 돌아간다 (유료·무료 옵션을 다 고르고 옵션 화면으로 돌아갈 때) */
  back: () => void;
  /** 결제를 마친다 (결제 수단 화면의 완료 버튼) */
  finishPayment: (target: string) => void;
  /** 다시 도전하기 */
  restart: () => void;
  /** 결과 화면에 보여 줄 소요 시간과 도움 요청 횟수 */
  stats: { elapsedMs: number; helpCount: number };
  /** 멤버십 적립처럼 아직 만들지 않은 기능 */
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
