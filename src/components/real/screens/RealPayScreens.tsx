"use client";

import type { ReactNode } from "react";
import {
  CardInsertArrowIcon,
  GiftCardScanIcon,
  MobilePayTapIcon,
} from "@/components/icons/kiosk-icons";
import { PaymentAmount } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import { REAL_OUTLINE_CLASS, REAL_PRIMARY_CLASS, RealBottomBar } from "@/components/real/parts";
import { formatWon, payableTotal } from "@/features/order/order";

/* 결제 수단별 화면 (RCM10~RCM12). 모두 같은 틀: 제목 → 안내 그림 → 도움말 → 완료 버튼 */

function PayLayout({
  title,
  illustration,
  instruction,
  children,
}: {
  title: string;
  illustration: ReactNode;
  instruction: ReactNode;
  children: ReactNode;
}) {
  const { order } = useReal();

  return (
    <>
      <div className="text-center">
        <h2 className="text-22 font-bold">{title}</h2>
        <p className="mt-0.5 text-16 text-text-sub">
          <PaymentAmount amount={payableTotal(order)} />
        </p>
      </div>
      <div className="flex min-h-40 flex-1 flex-col items-center justify-center gap-3 rounded-3xl bg-gray-2 px-4 text-center short:min-h-32 short:gap-2 short:[&>svg]:size-16">
        {illustration}
        <p className="text-18 leading-[1.5] font-bold">{instruction}</p>
      </div>
      {children}
    </>
  );
}

/** 모바일페이 (RCM10) */
export function RealPayMobileScreen() {
  const { finishPayment } = useReal();

  return (
    <PayLayout
      title="모바일페이로 결제해 주세요"
      illustration={<MobilePayTapIcon size={96} />}
      instruction={
        <>
          휴대전화의 결제 화면을 열고
          <br />
          리더기에 가까이 대 주세요
        </>
      }
    >
      <div className="rounded-[18px] bg-gray-1 px-4 py-3 text-center short:py-2">
        <b className="text-16">지원 방식</b>
        <p className="text-16">삼성페이 · 애플페이 · NFC 간편결제</p>
      </div>
      <p className="rounded-[18px] bg-gray-1 px-4 py-3 text-16 leading-[1.45] short:py-2">
        결제가 끝날 때까지 휴대전화를 리더기에서 떼지 마세요.
      </p>
      <RealBottomBar>
        <button
          type="button"
          onClick={() => finishPayment("payMobile:done")}
          className={REAL_PRIMARY_CLASS}
        >
          결제 완료 확인
        </button>
      </RealBottomBar>
    </PayLayout>
  );
}

/** 기프트카드 (RCM11). 잔액은 인식 전이라 결제 예정 금액만 보여 준다 */
export function RealPayGiftCardScreen() {
  const { order, finishPayment } = useReal();

  return (
    <PayLayout
      title="기프트카드를 인식해 주세요"
      illustration={<GiftCardScanIcon size={96} />}
      instruction={
        <>
          카드 뒷면의 바코드를
          <br />
          스캐너에 보여 주세요
        </>
      }
    >
      <div className="flex flex-col gap-1.5 rounded-[20px] border-2 border-gray-1 px-4 py-3 text-16 short:gap-0.5 short:py-2">
        <div className="flex justify-between">
          <span>기프트카드 잔액</span>
          <span className="text-text-sub">인식 전</span>
        </div>
        <div className="flex justify-between text-18 font-bold">
          <span>결제 예정 금액</span>
          <span>{formatWon(payableTotal(order))}</span>
        </div>
      </div>
      <p className="rounded-[18px] bg-gray-1 px-4 py-3 text-16 leading-[1.45] short:py-2">
        잔액이 부족하면 다른 결제 방법을 다시 선택할 수 있어요.
      </p>
      <RealBottomBar>
        <button
          type="button"
          onClick={() => finishPayment("payGiftCard:done")}
          className={REAL_PRIMARY_CLASS}
        >
          기프트카드 인식 완료
        </button>
      </RealBottomBar>
    </PayLayout>
  );
}

/** 신용·체크카드 (RCM12) */
export function RealPayCardScreen() {
  const { back, finishPayment } = useReal();

  return (
    <PayLayout
      title="카드를 넣어 주세요"
      illustration={<CardInsertArrowIcon size={96} />}
      instruction={
        <>
          IC칩 방향을 확인하고
          <br />
          카드를 끝까지 넣어 주세요
        </>
      }
    >
      <div className="rounded-[18px] bg-gray-1 px-4 py-3 text-center short:py-2">
        <b className="text-16">카드를 빼지 마세요</b>
        <p className="text-16">결제 완료 안내가 나올 때까지 기다려 주세요.</p>
      </div>
      <button type="button" onClick={back} className={REAL_OUTLINE_CLASS}>
        결제 방법 다시 선택
      </button>
      <RealBottomBar>
        <button
          type="button"
          onClick={() => finishPayment("payCard:done")}
          className={REAL_PRIMARY_CLASS}
        >
          결제 완료 확인
        </button>
      </RealBottomBar>
    </PayLayout>
  );
}
