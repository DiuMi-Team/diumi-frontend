import type { CafeMenuId, CupSize, Temperature } from "@/features/cafe/catalog";
import type { BurgerId, SetDrinkId, SideId } from "@/features/fastfood/catalog";
import type { DineOption, PaymentMethod } from "@/features/order/order";
import type { PracticeService } from "@/features/practice/types";

/** 미션에서 주문해야 하는 메뉴 */
export type ExpectedItem =
  | { type: "drink"; menuId: CafeMenuId; temperature: Temperature; size: CupSize; quantity: number }
  | {
      type: "burger";
      menuId: BurgerId;
      set: boolean;
      side: SideId | null;
      drink: SetDrinkId | null;
      quantity: number;
    };

/** 실전모드 미션. 정답 강조 없이 스스로 주문하고, 결제를 마치면 미션대로 했는지 판정한다 */
export type RealMission = {
  id: string;
  /** 백엔드 미션 ID (GET /scenarios/{id}/missions) */
  apiMissionId: number;
  service: PracticeService;
  /** 오늘의 미션 문장 */
  instruction: string;
  /** 미션 문장 아래 작은 안내. 예: "결제 방법: 신용·체크카드" */
  note: string;
  /** 진행 중 화면 위에 띄우는 짧은 미션 */
  chip: string;
  /** 완료 조건 목록. 판정도 이 순서로 한다 */
  conditions: string[];
  /** 미션대로 주문했는지 판정하는 기준 */
  expected: {
    item: ExpectedItem;
    dineOption: DineOption;
    paymentMethod: PaymentMethod;
  };
  /** 실전 유형 선택 화면 (첫 화면의 이전으로) */
  typeHref: string;
  /** 결제 완료 화면의 번호 (mock) */
  orderNumber: string;
};

export const CAFE_REAL_MISSION: RealMission = {
  id: "cafe-real-mission",
  apiMissionId: 101,
  service: "cafe",
  instruction: "아이스 아메리카노 Large 2잔을 포장으로 주문하세요.",
  note: "결제 방법: 신용·체크카드",
  chip: "아이스 아메리카노 2잔 · 포장 · 카드",
  conditions: ["아이스 아메리카노 선택", "Large 사이즈 · 수량 2잔", "포장 선택", "카드 결제 완료"],
  expected: {
    item: { type: "drink", menuId: "americano", temperature: "ice", size: "large", quantity: 2 },
    dineOption: "takeout",
    paymentMethod: "card",
  },
  typeHref: "/cafe/real",
  orderNumber: "133",
};

export const FASTFOOD_REAL_MISSION: RealMission = {
  id: "fastfood-real-mission",
  apiMissionId: 201,
  service: "fastfood",
  instruction: "불고기버거 세트 1개를 매장에서 먹도록 주문하세요.",
  note: "사이드: 감자튀김 · 음료: 콜라 · 카드 결제",
  chip: "불고기버거 세트 · 매장 · 카드",
  conditions: ["매장 식사 선택", "불고기버거 세트 선택", "감자튀김 · 콜라 선택", "카드 결제 완료"],
  expected: {
    item: {
      type: "burger",
      menuId: "bulgogi",
      set: true,
      side: "fries",
      drink: "cola",
      quantity: 1,
    },
    dineOption: "dineIn",
    paymentMethod: "card",
  },
  typeHref: "/fastfood/real",
  orderNumber: "A-127",
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

export const FASTFOOD_REAL_FREE: RealSetup = {
  service: "fastfood",
  typeHref: "/fastfood/real",
  orderNumber: "A-127",
  mission: null,
};
