"use client";

import type { ReactNode } from "react";
import { CreditCardIcon, GiftCardIcon, MobilePayIcon } from "@/components/icons/kiosk-icons";
import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import { PaymentAmount, ScreenHeading } from "@/components/practice/cafe/parts";
import { cartTotal, type PaymentMethod } from "@/features/order/order";

const METHODS: { value: PaymentMethod; name: string; icon: ReactNode }[] = [
  { value: "mobilePay", name: "모바일페이", icon: <MobilePayIcon size={52} /> },
  { value: "card", name: "신용·체크카드", icon: <CreditCardIcon size={52} /> },
  { value: "giftCard", name: "기프트카드", icon: <GiftCardIcon size={52} /> },
];

export function PaymentMethodScreen() {
  const { step, order } = usePractice();

  return (
    <>
      <ScreenHeading
        title="결제 방법을 선택해 주세요"
        sub={<PaymentAmount amount={cartTotal(order.cart)} />}
      />
      {METHODS.map(({ value, name, icon }) => {
        const id = `payment:${value}`;
        return (
          <KioskButton
            key={value}
            id={id}
            className="flex h-[84px] items-center gap-3.5 rounded-3xl bg-gray-1 px-[18px] text-left text-20 font-bold"
          >
            {icon}
            <span className="flex-1">{name}</span>
            {step.target.id === id && (
              <span className="flex size-9 items-center justify-center rounded-full bg-white">
                <ChevronRightIcon size={18} />
              </span>
            )}
          </KioskButton>
        );
      })}
    </>
  );
}
