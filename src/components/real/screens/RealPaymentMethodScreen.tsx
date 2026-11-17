"use client";

import type { ReactNode } from "react";
import {
  CouponIcon,
  CreditCardIcon,
  GiftCardIcon,
  MobilePayIcon,
} from "@/components/icons/kiosk-icons";
import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { PaymentAmount, ScreenHeading } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import { couponDiscount, payableTotal, type PaymentMethod } from "@/features/order/order";
import type { RealScreen } from "@/features/real/flow";

type Method = {
  /** null이면 결제 수단이 아니라 아직 준비 중인 기능 (쿠폰·포인트) */
  value: PaymentMethod | null;
  name: string;
  icon: ReactNode;
  next: RealScreen | null;
};

const MOBILE: Method = {
  value: "mobilePay",
  name: "모바일페이",
  icon: <MobilePayIcon size={52} />,
  next: "payMobile",
};
const CARD: Method = {
  value: "card",
  name: "신용·체크카드",
  icon: <CreditCardIcon size={52} />,
  next: "payCard",
};
const GIFT: Method = {
  value: "giftCard",
  name: "기프트카드",
  icon: <GiftCardIcon size={52} />,
  next: "payGiftCard",
};
const COUPON: Method = {
  value: null,
  name: "쿠폰·포인트",
  icon: <CouponIcon size={52} tone="orange" />,
  next: null,
};

/** 결제 방식 선택. 카페 (RCM09)와 패스트푸드 (RBM08)는 순서와 쿠폰·포인트 칸이 다르다 */
export function RealPaymentMethodScreen() {
  const { setup, order, act, go, comingSoon } = useReal();
  const isFastfood = setup.service === "fastfood";
  const methods = isFastfood ? [CARD, MOBILE, COUPON, GIFT] : [MOBILE, CARD, GIFT];

  return (
    <>
      <ScreenHeading
        title="결제 방법을 선택해 주세요"
        sub={<PaymentAmount amount={payableTotal(order)} discount={couponDiscount(order)} />}
      />
      {methods.map(({ value, name, icon, next }) => (
        <button
          key={name}
          type="button"
          onClick={() => {
            if (!value || !next) {
              comingSoon();
              return;
            }
            act({ type: "selectPayment", value }, `payment:${value}`);
            go(next);
          }}
          className={`flex items-center gap-3.5 rounded-3xl bg-gray-1 px-[18px] text-left text-20 font-bold short:[&>svg]:size-11 ${
            isFastfood ? "h-[76px] short:h-16" : "h-[84px] short:h-[68px]"
          }`}
        >
          {icon}
          <span className="flex-1">{name}</span>
          <span className="flex size-9 items-center justify-center rounded-full bg-white">
            <ChevronRightIcon size={18} />
          </span>
        </button>
      ))}
      {isFastfood && (
        <p className="flex items-center gap-3 rounded-[20px] bg-gray-2 px-4 py-3.5 text-17 font-bold short:py-2.5">
          <CreditCardIcon size={28} />
          {/* 미션은 카드 결제라 카드 위치를, 자유 체험은 일반 안내를 보여 준다 (RBM08, RBF08) */}
          {setup.mission
            ? "카드를 아래쪽 리더기에 넣어 주세요"
            : "선택한 결제 수단의 사용 위치가 표시돼요"}
        </p>
      )}
    </>
  );
}
