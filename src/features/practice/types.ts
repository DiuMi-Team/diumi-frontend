import type { OrderAction, OrderState } from "@/features/order/order";

/** 연습 엔진이 그릴 수 있는 키오스크 화면 */
export type PracticeScreen =
  | "dineOption"
  | "menu"
  | "options"
  | "paidOptions"
  | "orderReview"
  | "membership"
  | "paymentMethod"
  | "cardInsert"
  | "paymentDone";

export type PracticeStep = {
  /** 디자인 화면 ID. 예: "PC02" */
  id: string;
  screen: PracticeScreen;
  progress: {
    stage: number;
    /** 진행바 옆 설명. 예: "아메리카노 1잔 담기 (1/3)" */
    detail: string;
  };
  guide: {
    title: string;
    detail?: string;
  };
  target: {
    /** 화면 안의 눌러야 할 곳. 예: "menu:americano" */
    id: string;
    /** 잘못 눌렀을 때 안내에 쓴다. 조사까지 넣는다. 예: "아메리카노를" */
    label: string;
  };
  /** 눌러야 할 곳을 눌렀을 때 주문 상태에 적용할 동작. 화면만 넘기면 없다 */
  action?: OrderAction;
  /** 이 화면에서 미션과 다르게 고를 수 있는 칸 (PX2) */
  detours?: PracticeDetour[];
};

/**
 * 미션과 다르게 고르는 경우. 누르면 선택은 실제로 바뀌고, 바로잡을 때까지 빨간 안내가 뜬다.
 * 예: 2잔을 담는 단계에서 −를 눌러 1잔이 된 경우 → "미션은 2잔이에요. ＋를 한 번 더 눌러 보세요"
 */
export type PracticeDetour = {
  /** 이 칸을 누르면 미션과 달라진다. 예: "quantity:decrease" */
  trigger: string;
  action: OrderAction;
  /** 빨간 안내 */
  guide: {
    title: string;
    detail?: string;
  };
  /** 바로잡는 칸. 누르면 원래 단계로 돌아간다 */
  fix: {
    id: string;
    label: string;
    action: OrderAction;
  };
};

export type PracticeMission = {
  id: string;
  service: "cafe";
  title: string;
  /** 진행바 칸 수 */
  totalStages: number;
  /** 미션 선택 화면 (첫 화면의 이전으로, 완료 화면의 한 번 더 연습) */
  selectHref: string;
  /** 완료 화면의 실전모드 도전 */
  realHref: string;
  intro: {
    items: { title: string; detail?: string }[];
    estimatedMinutes: number;
  };
  /** 쿠폰 미션처럼 장바구니가 차 있는 상태에서 시작할 때 쓴다 */
  initialOrder?: Partial<OrderState>;
  steps: PracticeStep[];
  waitingNumber: number;
  /** 완료 화면에 체크 표시와 함께 보여 줄 내용 */
  summary: string[];
};
