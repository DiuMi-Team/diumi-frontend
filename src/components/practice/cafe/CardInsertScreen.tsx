"use client";

import { CardInsertIcon } from "@/components/icons/kiosk-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import {
  KIOSK_OUTLINE_CLASS,
  KIOSK_PRIMARY_CLASS,
  PaymentAmount,
  ScreenHeading,
} from "@/components/practice/cafe/parts";
import { payableTotal } from "@/features/order/order";

export function CardInsertScreen() {
  const { order } = usePractice();

  return (
    <>
      <ScreenHeading
        title="카드를 넣어 주세요"
        sub={<PaymentAmount amount={payableTotal(order)} />}
      />
      {/* 디자인의 "[카드 넣는 위치 안내 이미지]"는 실제 이미지가 들어올 자리라 글자는 빼고 그림만 둔다 */}
      <div className="flex min-h-40 flex-1 items-center justify-center rounded-3xl border-2 border-dashed border-text-sub bg-gray-2">
        <CardInsertIcon size={80} />
      </div>
      <div className="rounded-[18px] bg-gray-1 px-4 py-3 text-16 leading-[1.45]">
        결제가 끝날 때까지 카드를 빼지 마세요.
      </div>
      <KioskButton id="card:reselect" className={KIOSK_OUTLINE_CLASS}>
        결제 방법 다시 선택
      </KioskButton>
      <KioskButton id="card:inserted" className={KIOSK_PRIMARY_CLASS}>
        카드를 넣었어요
      </KioskButton>
    </>
  );
}
