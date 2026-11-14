import type { ComponentType } from "react";
import { CardInsertScreen } from "@/components/practice/kiosk/CardInsertScreen";
import { CouponAppliedScreen } from "@/components/practice/kiosk/CouponAppliedScreen";
import { BurgerConfirmScreen } from "@/components/practice/kiosk/BurgerConfirmScreen";
import { CouponScanScreen } from "@/components/practice/kiosk/CouponScanScreen";
import { DineOptionScreen } from "@/components/practice/kiosk/DineOptionScreen";
import { MembershipScreen } from "@/components/practice/kiosk/MembershipScreen";
import { MenuScreen } from "@/components/practice/kiosk/MenuScreen";
import { OptionsScreen } from "@/components/practice/kiosk/OptionsScreen";
import { OrderReviewScreen } from "@/components/practice/kiosk/OrderReviewScreen";
import { PaidOptionsScreen } from "@/components/practice/kiosk/PaidOptionsScreen";
import { PaymentDoneScreen } from "@/components/practice/kiosk/PaymentDoneScreen";
import { PaymentMethodScreen } from "@/components/practice/kiosk/PaymentMethodScreen";
import { SetChoiceScreen } from "@/components/practice/kiosk/SetChoiceScreen";
import { SetComposeScreen } from "@/components/practice/kiosk/SetComposeScreen";
import type { PracticeScreen } from "@/features/practice/types";

/** 미션 데이터의 screen 이름 → 키오스크 화면 (카페·패스트푸드 공통) */
export const KIOSK_SCREENS: Record<PracticeScreen, ComponentType> = {
  dineOption: DineOptionScreen,
  menu: MenuScreen,
  setChoice: SetChoiceScreen,
  setCompose: SetComposeScreen,
  burgerConfirm: BurgerConfirmScreen,
  options: OptionsScreen,
  paidOptions: PaidOptionsScreen,
  orderReview: OrderReviewScreen,
  membership: MembershipScreen,
  couponScan: CouponScanScreen,
  couponApplied: CouponAppliedScreen,
  paymentMethod: PaymentMethodScreen,
  cardInsert: CardInsertScreen,
  paymentDone: PaymentDoneScreen,
};

/** 옵션·유료 옵션 화면은 칸이 많아 간격이 10px, 나머지는 12px */
export const SCREEN_GAP: Partial<Record<PracticeScreen, string>> = {
  options: "gap-2.5 short:gap-1",
  paidOptions: "gap-2.5 short:gap-1",
  setCompose: "gap-2.5 short:gap-1.5",
};
