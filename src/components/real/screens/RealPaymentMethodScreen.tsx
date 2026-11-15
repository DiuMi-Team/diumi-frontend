"use client";

import type { ReactNode } from "react";

import { CreditCardIcon, GiftCardIcon, MobilePayIcon } from "@/components/icons/kiosk-icons";
import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { PaymentAmount, ScreenHeading } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import { couponDiscount, payableTotal, type PaymentMethod } from "@/features/order/order";
import type { RealScreen } from "@/features/real/flow";

const METHODS: { value: PaymentMethod; name: string; icon: ReactNode; next: RealScreen }[] = [
  { value: "mobilePay", name: "모바일페이", icon: <MobilePayIcon size={52} />, next: "payMobile" },
  { value: "card", name: "신용·체크카드", icon: <CreditCardIcon size={52} />, next: "payCard" },
  { value: "giftCard", name: "기프트카드", icon: <GiftCardIcon size={52} />, next: "payGiftCard" },
];

/** 결제 방식 선택 (RCM09) */
export function RealPaymentMethodScreen() {
  const { order, act, go } = useReal();

  return (
    <>
      <ScreenHeading
        title="결제 방법을 선택해 주세요"
        sub={<PaymentAmount amount={payableTotal(order)} discount={couponDiscount(order)} />}
      />
      {METHODS.map(({ value, name, icon, next }) => (
        <button
          key={value}
          type="button"
          onClick={() => {
            act({ type: "selectPayment", value }, `payment:${value}`);
            go(next);
          }}
          className="flex h-[84px] items-center gap-3.5 rounded-3xl bg-gray-1 px-[18px] text-left text-20 font-bold short:h-[68px] short:[&>svg]:size-11"
        >
          {icon}
          <span className="flex-1">{name}</span>
          <span className="flex size-9 items-center justify-center rounded-full bg-white">
            <ChevronRightIcon size={18} />
          </span>
        </button>
      ))}
    </>
  );
}
