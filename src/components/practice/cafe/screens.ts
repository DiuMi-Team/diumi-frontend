import type { ComponentType } from "react";
import { CardInsertScreen } from "@/components/practice/cafe/CardInsertScreen";
import { DineOptionScreen } from "@/components/practice/cafe/DineOptionScreen";
import { MembershipScreen } from "@/components/practice/cafe/MembershipScreen";
import { MenuScreen } from "@/components/practice/cafe/MenuScreen";
import { OptionsScreen } from "@/components/practice/cafe/OptionsScreen";
import { OrderReviewScreen } from "@/components/practice/cafe/OrderReviewScreen";
import { PaidOptionsScreen } from "@/components/practice/cafe/PaidOptionsScreen";
import { PaymentDoneScreen } from "@/components/practice/cafe/PaymentDoneScreen";
import { PaymentMethodScreen } from "@/components/practice/cafe/PaymentMethodScreen";
import type { PracticeScreen } from "@/features/practice/types";

/** 미션 데이터의 screen 이름 → 카페 키오스크 화면 */
export const CAFE_SCREENS: Record<PracticeScreen, ComponentType> = {
  dineOption: DineOptionScreen,
  menu: MenuScreen,
  options: OptionsScreen,
  paidOptions: PaidOptionsScreen,
  orderReview: OrderReviewScreen,
  membership: MembershipScreen,
  paymentMethod: PaymentMethodScreen,
  cardInsert: CardInsertScreen,
  paymentDone: PaymentDoneScreen,
};

/** 옵션·유료 옵션 화면은 칸이 많아 간격이 10px, 나머지는 12px */
export const SCREEN_GAP: Partial<Record<PracticeScreen, string>> = {
  options: "gap-2.5",
  paidOptions: "gap-2.5",
};
