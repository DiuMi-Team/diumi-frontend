"use client";

import { CouponIcon } from "@/components/icons/kiosk-icons";
import { CheckIcon } from "@/components/icons/ui-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import { KIOSK_PRIMARY_CLASS, Spacer } from "@/components/practice/cafe/parts";
import {
  appliedCoupon,
  cartTotal,
  couponDiscount,
  formatWon,
  payableTotal,
} from "@/features/order/order";

/** 쿠폰 적용 확인 (PD05) */
export function CouponAppliedScreen() {
  const { step, order } = usePractice();
  const coupon = appliedCoupon(order);
  if (!coupon) throw new Error(`${step.id}: 적용된 쿠폰이 없어요. 미션 데이터를 확인해 주세요`);

  return (
    <>
      <div className="flex flex-col items-center gap-2.5 pt-2 short:gap-1.5 short:pt-0">
        <span className="flex size-20 items-center justify-center rounded-full bg-mint-light text-mint short:size-14 short:[&>svg]:size-9">
          <CheckIcon size={48} />
        </span>
        <h2 className="text-26 font-bold">쿠폰이 적용되었어요</h2>
      </div>
      <div className="flex flex-col gap-2.5 rounded-3xl bg-gray-1 px-[18px] py-4 text-17 short:gap-1.5 short:py-3">
        <div className="flex items-center gap-3 border-b-2 border-white pb-3">
          <CouponIcon size={40} tone="orange" />
          <span className="flex flex-1 flex-col">
            <b className="text-18">{coupon.name}</b>
            <span className="text-16 text-text-sub">{coupon.description}</span>
          </span>
          <span className="rounded-full bg-mint-light px-3 py-1 text-16 font-bold">적용됨</span>
        </div>
        <div className="flex justify-between">
          <span>주문 금액</span>
          <span>{formatWon(cartTotal(order.cart))}</span>
        </div>
        <div className="flex justify-between font-bold text-primary">
          <span>쿠폰 할인</span>
          <span>−{formatWon(couponDiscount(order))}</span>
        </div>
        <div className="flex justify-between border-t-2 border-white pt-2.5 text-22 font-bold">
          <span>결제할 금액</span>
          <span>{formatWon(payableTotal(order))}</span>
        </div>
      </div>
      <Spacer />
      <KioskButton id="coupon:next" className={KIOSK_PRIMARY_CLASS}>
        다음
      </KioskButton>
    </>
  );
}
