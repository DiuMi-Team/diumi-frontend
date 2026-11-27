"use client";

import { IcedCoffeeIcon, MenuIcon } from "@/components/icons/kiosk-icons";
import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { Spacer } from "@/components/practice/kiosk/parts";
import {
  CartDeleteButton,
  CartHeading,
  EmptyCart,
  useCartDelete,
} from "@/components/real/CartDelete";
import { useReal } from "@/components/real/RealContext";
import {
  REAL_OUTLINE_CLASS,
  REAL_PRIMARY_CLASS,
  RealBottomBar,
  Stepper,
} from "@/components/real/parts";
import { cartTotal, couponDiscount, formatWon, payableTotal } from "@/features/order/order";
import { realDrinkDetail, realDrinkName } from "@/features/real/labels";

/** 장바구니 (RCM07, XCart). 여기서도 수량을 바꾸고 메뉴를 삭제할 수 있다 */
export function RealCartScreen() {
  const { order, act, go } = useReal();
  const cartDelete = useCartDelete();
  const empty = order.cart.length === 0;

  return (
    <>
      <CartHeading
        title="주문 내역을 확인해 주세요"
        onClearAll={empty ? undefined : cartDelete.askAll}
      />
      {empty && <EmptyCart />}
      <ul aria-label="주문 내역" className="flex flex-col gap-2.5">
        {order.cart.map((item, index) =>
          item.type === "drink" ? (
            <li
              key={index}
              className="flex flex-col gap-3 rounded-3xl bg-gray-1 px-[18px] py-4 short:gap-2 short:py-3"
            >
              <div className="flex items-center gap-3">
                {item.temperature === "ice" ? (
                  <IcedCoffeeIcon size={52} tone="mint" />
                ) : (
                  <MenuIcon menuId={item.menuId} size={52} />
                )}
                <span className="flex flex-1 flex-col">
                  <b className="text-19">{realDrinkName(item)}</b>
                  <span className="text-16 text-text-sub">
                    {realDrinkDetail(item, order.dineOption)}
                  </span>
                </span>
                <CartDeleteButton
                  label={realDrinkName(item)}
                  onClick={() => cartDelete.askItem(index)}
                />
              </div>
              <div className="flex items-center justify-between border-t-2 border-white pt-3 text-18 font-bold short:pt-2">
                <span>수량</span>
                <Stepper
                  value={item.quantity}
                  unit="잔"
                  label={`${realDrinkName(item)} 수량`}
                  onChange={(value) =>
                    act({ type: "setCartQuantity", index, value }, `cart:${index}:${value}`)
                  }
                />
              </div>
            </li>
          ) : null,
        )}
      </ul>
      <div className="flex flex-col gap-1.5 rounded-[20px] border-2 border-gray-1 px-4 py-3 text-16 short:gap-0.5 short:py-2">
        <div className="flex justify-between">
          <span>주문 금액</span>
          <span>{formatWon(cartTotal(order.cart))}</span>
        </div>
        <div className="flex justify-between">
          <span>할인 금액</span>
          <span>{formatWon(couponDiscount(order))}</span>
        </div>
        <div className="flex justify-between text-20 font-bold">
          <span>결제 금액</span>
          <span>{formatWon(payableTotal(order))}</span>
        </div>
      </div>
      <Spacer />
      <button type="button" onClick={() => go("menu")} className={REAL_OUTLINE_CLASS}>
        메뉴 더 담기
      </button>
      <RealBottomBar>
        <button
          type="button"
          disabled={empty}
          onClick={() => go("membership")}
          className={`${REAL_PRIMARY_CLASS} disabled:opacity-45`}
        >
          다음
          <ChevronRightIcon size={20} />
        </button>
      </RealBottomBar>
      {cartDelete.dialog}
    </>
  );
}
