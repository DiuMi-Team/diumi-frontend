import type { OrderState } from "@/features/order/order";
import type { PracticeService } from "@/features/practice/types";

/** 실전모드 미션. 정답 강조 없이 스스로 주문하고, 결제를 마치면 미션대로 했는지 판정한다 */
export type RealMission = {
  id: string;
  service: PracticeService;
  /** 오늘의 미션 문장 */
  instruction: string;
  /** 결제 방법 안내 */
  payment: string;
  /** 진행 중 화면 위에 띄우는 짧은 미션 */
  chip: string;
  /** 완료 조건 목록 */
  conditions: string[];
  /** 미션대로 주문했는지 판정하는 기준 */
  expected: {
    cart: {
      menuId: string;
      temperature?: "hot" | "ice";
      size?: string;
      quantity: number;
    }[];
    dineOption: OrderState["dineOption"];
    paymentMethod: OrderState["paymentMethod"];
  };
  /** 실전 유형 선택 화면 (첫 화면의 이전으로) */
  typeHref: string;
  /** 결제 완료 화면의 번호 (mock) */
  orderNumber: string;
};

export const CAFE_REAL_MISSION: RealMission = {
  id: "cafe-real-mission",
  service: "cafe",
  instruction: "아이스 아메리카노 Large 2잔을 포장으로 주문하세요.",
  payment: "신용·체크카드",
  chip: "아이스 아메리카노 2잔 · 포장 · 카드",
  conditions: ["아이스 아메리카노 선택", "Large 사이즈 · 수량 2잔", "포장 선택", "카드 결제 완료"],
  expected: {
    cart: [{ menuId: "americano", temperature: "ice", size: "large", quantity: 2 }],
    dineOption: "takeout",
    paymentMethod: "card",
  },
  typeHref: "/cafe/real",
  orderNumber: "133",
};

/**
 * 실전 진행 설정. mission이 있으면 미션 수행, 없으면 자유 체험이다.
 * 자유 체험은 미션 확인·진행바·판정 없이 주문 과정과 도움 요청만 기록한다.
 */
export type RealSetup = {
  service: PracticeService;
  /** 실전 유형 선택 화면 (첫 화면의 이전으로) */
  typeHref: string;
  /** 결제 완료 화면의 번호 (mock) */
  orderNumber: string;
  mission: RealMission | null;
};

export function missionSetup(mission: RealMission): RealSetup {
  return {
    service: mission.service,
    typeHref: mission.typeHref,
    orderNumber: mission.orderNumber,
    mission,
  };
}

export const CAFE_REAL_FREE: RealSetup = {
  service: "cafe",
  typeHref: "/cafe/real",
  orderNumber: "133",
  mission: null,
};
