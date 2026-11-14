"use client";

import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { PaymentAmount, ScreenHeading } from "@/components/practice/kiosk/parts";
import { couponDiscount, formatWon, payableTotal } from "@/features/order/order";

const ROW_CLASS =
  "flex items-center gap-3.5 rounded-3xl px-[18px] text-left text-20 font-bold short:[&>svg]:size-11";
const NORMAL_CLASS = "h-[84px] bg-gray-1 short:h-[68px]";
/** 이미 쓴 쿠폰·포인트 줄 (PF06). 고른 항목 모양으로 할인 금액을 보여 준다 */
const APPLIED_CLASS = "h-20 border-3 border-primary bg-white text-primary short:h-16";

/** 결제 방법 선택 (카페 PC09, 패스트푸드 PE08·PF03·PF06 등) */
export function PaymentMethodScreen() {
  const { mission, step, order } = usePractice();
  const discount = couponDiscount(order);

  return (
    <>
      <ScreenHeading
        title="결제 방법을 선택해 주세요"
        sub={<PaymentAmount amount={payableTotal(order)} discount={discount} />}
      />
      {KIOSK_COPY[mission.service].paymentMethods.map(({ id, name, icon }) => {
        const applied = id === "payment:couponPoint" && discount > 0;
        return (
          <KioskButton
            key={id}
            id={id}
            pressed={applied || undefined}
            inactiveClassName={applied ? "opacity-90" : undefined}
            className={`${ROW_CLASS} ${applied ? APPLIED_CLASS : NORMAL_CLASS}`}
          >
            {icon}
            <span className="flex-1">{name}</span>
            {applied && <span className="text-16">−{formatWon(discount)} 적용</span>}
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
