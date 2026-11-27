"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/icons/ui-icons";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { Spacer } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import { REAL_PRIMARY_CLASS, RealBottomBar } from "@/components/real/parts";
import {
  cartTotal,
  couponDiscount,
  itemName,
  itemPrice,
  payableTotal,
  type CartItem,
  type PaymentMethod,
} from "@/features/order/order";
import { PAYMENT_LABEL, realDrinkName } from "@/features/real/labels";

const DINE_LABEL = { dineIn: "매장", takeout: "포장" } as const;

/** 영수증의 결제 수단. 카드는 체험용 가짜 번호 끝자리를 붙인다 */
const RECEIPT_PAYMENT: Record<PaymentMethod, string> = {
  card: `${PAYMENT_LABEL.card} (****-1234)`,
  mobilePay: PAYMENT_LABEL.mobilePay,
  giftCard: PAYMENT_LABEL.giftCard,
};

/** "2026.11.27 18:30" */
function formatReceiptTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

/** 천 단위 쉼표만 (표 안의 금액은 "원"을 붙이지 않는다) */
const amount = (value: number) => value.toLocaleString("ko-KR");

function receiptName(item: CartItem): string {
  return item.type === "drink" ? realDrinkName(item) : itemName(item);
}

/** 영수증 아래 가장자리 톱니 (시안의 path 그대로, 5px 간격) */
const TEETH_PATH = `M0 0H300V4${Array.from({ length: 30 }, (_, index) => {
  const x = 300 - index * 10;
  return `L${x - 5} 10L${x - 10} 4`;
}).join("")}Z`;

/**
 * 결제 완료 영수증 (RCM13·RBM12, XReceipt). 결제를 마쳐서 되돌아갈 수 없다.
 * 대기번호 큰 박스 대신 실제 주문 내용으로 영수증을 채운다(시안 값은 예시).
 */
export function RealDoneScreen() {
  const { setup, order, go } = useReal();
  const copy = KIOSK_COPY[setup.service];
  /* 이 화면에 들어온 시각을 주문 일시로 쓴다 */
  const [paidAt] = useState(() => new Date());
  const discount = couponDiscount(order);
  const rowGrid = "grid grid-cols-[minmax(0,1fr)_40px_72px] gap-2";

  return (
    <>
      <div className="flex items-center gap-3 px-0.5 pt-1.5 short:pt-0">
        <span className="flex size-[52px] flex-none items-center justify-center rounded-full bg-mint-light text-mint">
          <CheckIcon size={30} />
        </span>
        <span className="flex flex-col">
          <h2 className="text-24 font-bold">결제가 완료되었어요</h2>
          <span className="text-16 text-text-sub">주문하신 내용을 확인해 주세요</span>
        </span>
      </div>

      <section aria-label="영수증" className="rounded-3xl bg-gray-1 p-3.5">
        <div className="drop-shadow-[0_4px_10px_rgb(61_53_49/0.12)]">
          <div className="flex flex-col gap-2.5 rounded-t-[18px] bg-white-pure px-[18px] pt-[18px] pb-3.5 tabular-nums short:gap-1.5 short:pt-3.5">
            <div className="flex items-center justify-between gap-2">
              <b className="text-20">영수증</b>
              <span className="text-16 text-text-sub">
                디우미 {copy.serviceName}
                {order.dineOption && ` · ${DINE_LABEL[order.dineOption]}`}
              </span>
            </div>
            <div className="flex justify-between gap-2 text-16 text-text-sub">
              <span>{formatReceiptTime(paidAt)}</span>
              <span>
                {copy.numberLabel} <b className="text-text">{setup.orderNumber}</b>
              </span>
            </div>
            <div className="border-t-2 border-dashed border-gray-2" />
            <div className={`${rowGrid} text-16 font-semibold text-text-sub`}>
              <span>메뉴</span>
              <span className="text-center">수량</span>
              <span className="text-right">금액</span>
            </div>
            <ul aria-label="주문한 메뉴" className="flex flex-col gap-2.5 short:gap-1.5">
              {order.cart.map((item, index) => (
                <li key={index} className={`${rowGrid} text-16`}>
                  <span>{receiptName(item)}</span>
                  <span className="text-center">{item.quantity}</span>
                  <span className="text-right">{amount(itemPrice(item))}</span>
                </li>
              ))}
            </ul>
            <div className="border-t-2 border-dashed border-gray-2" />
            <div className="flex justify-between text-16">
              <span>주문 금액</span>
              <span>{amount(cartTotal(order.cart))}원</span>
            </div>
            <div className="flex justify-between text-16">
              <span>할인</span>
              <span>{discount > 0 ? `-${amount(discount)}` : 0}원</span>
            </div>
            <div className="flex justify-between text-22 font-bold">
              <span>합계</span>
              <span>{amount(payableTotal(order))}원</span>
            </div>
            {order.paymentMethod && (
              <div className="flex justify-between gap-2 text-16 text-text-sub">
                <span>결제 수단</span>
                <span>{RECEIPT_PAYMENT[order.paymentMethod]}</span>
              </div>
            )}
          </div>
          <svg
            width="100%"
            height="10"
            viewBox="0 0 300 10"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="block"
          >
            <path d={TEETH_PATH} fill="#ffffff" />
          </svg>
        </div>
      </section>

      <Spacer />
      <RealBottomBar>
        <button type="button" onClick={() => go("result")} className={REAL_PRIMARY_CLASS}>
          결과 보기
        </button>
      </RealBottomBar>
    </>
  );
}
