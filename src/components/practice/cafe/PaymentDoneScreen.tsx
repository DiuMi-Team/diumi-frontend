"use client";

import { CheckIcon, ReceiptIcon } from "@/components/icons/ui-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import { KIOSK_PRIMARY_CLASS, Spacer } from "@/components/practice/cafe/parts";

export function PaymentDoneScreen() {
  const { mission } = usePractice();

  return (
    <>
      <div className="flex flex-col items-center gap-2.5 pt-2 short:gap-1.5 short:pt-0">
        <span className="flex size-20 items-center justify-center rounded-full bg-mint-light text-mint short:size-14 short:[&>svg]:size-9">
          <CheckIcon size={48} />
        </span>
        <h2 className="text-26 font-bold">결제가 완료되었습니다</h2>
      </div>
      <div className="flex flex-col items-center rounded-[28px] bg-gray-1 p-5 short:py-3">
        <span className="text-17 font-bold text-text-sub">대기번호</span>
        <b className="text-72 leading-[1.1] text-primary short:text-56">{mission.waitingNumber}</b>
      </div>
      <div className="flex items-center justify-center gap-2 text-16 text-text-sub">
        <ReceiptIcon size={22} />
        영수증이 출력되고 있어요
      </div>
      <Spacer />
      <KioskButton id="done:confirm" className={KIOSK_PRIMARY_CLASS}>
        확인
      </KioskButton>
    </>
  );
}
