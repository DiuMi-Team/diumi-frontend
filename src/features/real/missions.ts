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
};
