"use client";

import { MenuIcon } from "@/components/icons/kiosk-icons";
import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import {
  KIOSK_OUTLINE_CLASS,
  KIOSK_PRIMARY_CLASS,
  ScreenHeading,
  Spacer,
} from "@/components/practice/cafe/parts";
import { getCafeMenu } from "@/features/cafe/catalog";
import {
  cartTotal,
  couponDiscount,
  formatWon,
  itemOptionLabel,
  itemPrice,
  payableTotal,
  type DineOption,
} from "@/features/order/order";

const DINE_LABEL: Record<DineOption, string> = { dineIn: "매장", takeout: "포장" };

export function OrderReviewScreen() {
  const { order } = usePractice();
  const total = cartTotal(order.cart);
  const discount = couponDiscount(order);

  return (
    <>
      <ScreenHeading title="주문 내역을 확인해 주세요" />
      <ul
        aria-label="주문 내역"
        className="flex flex-col rounded-3xl bg-gray-1 px-4 py-1 short:py-0.5"
      >
        {order.cart.map((item, index) => (
          <li key={index} className="flex items-center gap-3 py-3 short:py-1.5">
            <MenuIcon menuId={item.menuId} size={44} shadow={false} />
            <span className="flex flex-1 flex-col">
              <b className="text-18">{getCafeMenu(item.menuId).name}</b>
              <span className="text-16 text-text-sub">
                {itemOptionLabel(item)}
                {order.dineOption && ` · ${DINE_LABEL[order.dineOption]}`}
              </span>
            </span>
            <span className="flex flex-col items-end text-16">
              <b className="text-17">{formatWon(itemPrice(item))}</b>
              {item.quantity}잔
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-1.5 rounded-[20px] border-2 border-gray-1 px-4 py-3 text-16 short:gap-0.5 short:py-2">
        <div className="flex justify-between">
          <span>주문 금액</span>
          <span>{formatWon(total)}</span>
        </div>
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
        메뉴 더 담기
      </KioskButton>
      <KioskButton id="review:next" className={KIOSK_PRIMARY_CLASS}>
        다음
        <ChevronRightIcon size={20} />
      </KioskButton>
    </>
  );
}
