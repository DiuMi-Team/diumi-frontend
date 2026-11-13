"use client";

import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import {
  ItemIcon,
  KIOSK_OUTLINE_CLASS,
  KIOSK_PRIMARY_CLASS,
  ScreenHeading,
  Spacer,
} from "@/components/practice/kiosk/parts";
import {
  cartTotal,
  couponDiscount,
  formatWon,
  itemDetail,
  itemName,
  itemPrice,
  itemUnit,
  payableTotal,
  type DineOption,
} from "@/features/order/order";

const DINE_LABEL: Record<DineOption, string> = { dineIn: "매장", takeout: "포장" };

/** 주문 내역 확인 (카페 PC07, 패스트푸드 PE07 등) */
export function OrderReviewScreen() {
  const { mission, order } = usePractice();
  const copy = KIOSK_COPY[mission.service];
  const isCafe = mission.service === "cafe";
  const total = cartTotal(order.cart);
  const discount = couponDiscount(order);
  const dineLabel = order.dineOption ? DINE_LABEL[order.dineOption] : null;

  return (
    <>
      <ScreenHeading title="주문 내역을 확인해 주세요" />
      <ul
        aria-label="주문 내역"
        className="flex flex-col rounded-3xl bg-gray-1 px-4 py-1 short:py-0.5"
      >
        {order.cart.map((item, index) => (
          <li key={index} className="flex items-center gap-3 py-3 short:py-1.5">
            <ItemIcon item={item} size={44} shadow={false} />
            <span className="flex flex-1 flex-col">
              <b className="text-18">{itemName(item)}</b>
              <span className="text-16 text-text-sub">
                {itemDetail(item)}
                {/* 카페는 메뉴 옆에, 패스트푸드는 아래 합계 칸에 이용 방법을 보여 준다 */}
                {isCafe && dineLabel && ` · ${dineLabel}`}
              </span>
            </span>
            <span className="flex flex-col items-end text-16">
              <b className="text-17">{formatWon(itemPrice(item))}</b>
              {item.quantity}
              {itemUnit(item)}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-1.5 rounded-[20px] border-2 border-gray-1 px-4 py-3 text-16 short:gap-0.5 short:py-2">
        {isCafe ? (
          <div className="flex justify-between">
            <span>주문 금액</span>
            <span>{formatWon(total)}</span>
          </div>
        ) : (
          <div className="flex justify-between">
            <span>이용 방법</span>
            <b>{dineLabel}</b>
          </div>
        )}
        {discount > 0 && (
          <div className="flex justify-between font-bold text-primary">
            <span>쿠폰 할인</span>
            <span>−{formatWon(discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-20 font-bold">
          <span>결제 금액</span>
          <span>{formatWon(payableTotal(order))}</span>
        </div>
      </div>
      <Spacer />
      <KioskButton id="review:addMore" className={KIOSK_OUTLINE_CLASS}>
        {copy.review.addMore}
      </KioskButton>
      <KioskButton id="review:next" className={KIOSK_PRIMARY_CLASS}>
        {copy.review.next}
        <ChevronRightIcon size={20} />
      </KioskButton>
    </>
  );
}
