"use client";

import { CheckIcon, ReceiptIcon } from "@/components/icons/ui-icons";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { Spacer } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import { REAL_PRIMARY_CLASS } from "@/components/real/parts";

/** 결제 완료·대기번호 (RCM13). 결제를 마쳐서 되돌아갈 수 없다 */
export function RealDoneScreen() {
  const { setup, go } = useReal();
  const isCafe = setup.service === "cafe";

  return (
    <>
      <div className="flex flex-col items-center gap-2.5 pt-4 text-center short:gap-1.5 short:pt-1">
        <span className="flex size-24 items-center justify-center rounded-full bg-mint-light text-mint short:size-16 short:[&>svg]:size-10">
          <CheckIcon size={56} />
        </span>
        <h2 className="text-28 font-bold">결제가 완료되었습니다</h2>
        {isCafe && (
          <p className="text-17 text-text-sub">영수증 출력이 완료될 때까지 기다려 주세요.</p>
        )}
      </div>
      <div className="flex flex-col items-center rounded-[28px] bg-gray-1 py-6 short:py-3">
        <span className="text-17 font-bold text-text-sub">
          {KIOSK_COPY[setup.service].numberLabel}
        </span>
        <b className="text-72 leading-[1.1] short:text-56">{setup.orderNumber}</b>
      </div>
      {!isCafe && (
        <p className="rounded-[20px] border-2 border-gray-1 px-4 py-3.5 text-center text-17 leading-[1.5] short:py-2.5">
          영수증을 챙기고 화면에 주문번호가
          <br />
          표시될 때까지 기다려 주세요.
        </p>
      )}
      <div className="flex items-center justify-center gap-2 rounded-[22px] bg-gray-2 py-4 text-17 font-bold short:py-3">
        <ReceiptIcon size={24} />
        {isCafe ? "영수증이 출력되고 있어요" : "영수증 출력 중"}
      </div>
      <Spacer />
      <button type="button" onClick={() => go("result")} className={REAL_PRIMARY_CLASS}>
        {isCafe ? "결제 완료 확인" : "주문번호 확인"}
      </button>
    </>
  );
}
