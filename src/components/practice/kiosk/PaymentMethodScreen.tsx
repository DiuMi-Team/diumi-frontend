"use client";

import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { PaymentAmount, ScreenHeading } from "@/components/practice/kiosk/parts";
import { couponDiscount, payableTotal } from "@/features/order/order";

export function PaymentMethodScreen() {
  const { mission, step, order } = usePractice();

  return (
    <>
      <ScreenHeading
        title="결제 방법을 선택해 주세요"
        sub={<PaymentAmount amount={payableTotal(order)} discount={couponDiscount(order)} />}
      />
      {KIOSK_COPY[mission.service].paymentMethods.map(({ id, name, icon }) => {
        return (
          <KioskButton
            key={id}
            id={id}
            className="flex h-[84px] items-center gap-3.5 rounded-3xl bg-gray-1 px-[18px] text-left text-20 font-bold short:h-[68px] short:[&>svg]:size-11"
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
