"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { Spacer } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import { REAL_PRIMARY_CLASS } from "@/components/real/parts";
import type { CafeMenuId } from "@/features/cafe/catalog";
import { cartCount, cartTotal, formatWon } from "@/features/order/order";
import { realDrinkName } from "@/features/real/labels";

/** 메뉴판 (RCM02, RCM06). 장바구니가 차 있으면 "메뉴를 더 담아 보세요"와 결제하기 */
export function RealMenuScreen() {
  const { mission, order, act, go } = useReal();
  const [hint, setHint] = useState(false);
  const copy = KIOSK_COPY[mission.service];
  const isEmpty = order.cart.length === 0;

  return (
    <>
      <div>
        <h2 className="text-22 font-bold">
          {isEmpty ? "메뉴를 선택해 주세요" : copy.board.moreTitle}
        </h2>
        {!isEmpty && (
          <p className="mt-0.5 text-16 text-text-sub">선택한 음료가 아래 장바구니에 담겼어요</p>
        )}
      </div>
      <section
        aria-label="메뉴판"
        className="flex flex-col gap-2.5 rounded-3xl bg-gray-1 p-3 short:gap-1.5 short:p-2"
      >
        {/* 실전 키오스크는 커피 분류만 열려 있어 분류는 보여 주기만 한다 */}
        <div className="flex gap-1.5" aria-hidden="true">
          {copy.board.categories.map((category) => (
            <span
              key={category}
              className={`flex h-10 min-w-0 flex-1 items-center justify-center rounded-full text-16 font-bold whitespace-nowrap ${
                category === copy.board.defaultCategory ? "bg-primary text-white-pure" : "bg-white"
              }`}
            >
              {category}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {copy.board.items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-label={`${item.name} ${formatWon(item.price)}`}
              onClick={() => {
                act(
                  { type: "selectMenu", menuId: item.id.replace("menu:", "") as CafeMenuId },
                  item.id,
                );
                go("options");
              }}
              className={`flex flex-col items-center justify-center rounded-[20px] bg-white short:[&>svg]:size-9 ${
                isEmpty ? "h-[124px] short:h-24" : "h-28 short:h-[88px]"
              }`}
            >
              {item.icon(56)}
              <b className="text-17">{item.name}</b>
              <span className="text-16 text-text-sub">{formatWon(item.price)}</span>
            </button>
          ))}
        </div>
      </section>
      <div className="flex items-center justify-between gap-2.5 rounded-[20px] border-2 border-dashed border-gray-2 px-4 py-3 short:py-1.5">
        {isEmpty ? (
          <>
            <span className="text-16 text-text-sub">담은 메뉴</span>
            <b className="text-16 text-text-sub">
              {cartCount(order.cart)}개 · {formatWon(0)}
            </b>
          </>
        ) : (
          <>
            <span className="flex flex-col text-16 leading-[1.45]">
              <span className="font-bold text-text-sub">담은 메뉴</span>
              {order.cart.map((item, index) => (
                <span key={index}>
                  {item.type === "drink" ? realDrinkName(item) : ""} × {item.quantity}
                </span>
              ))}
            </span>
            <b className="text-17 whitespace-nowrap">{formatWon(cartTotal(order.cart))}</b>
          </>
        )}
      </div>
      {hint && (
        <p role="alert" className="text-center text-16 font-bold text-error-text">
          아직 담은 메뉴가 없어요. 먼저 메뉴를 골라 주세요.
        </p>
      )}
      <Spacer />
      {isEmpty ? (
        <button type="button" onClick={() => setHint(true)} className={REAL_PRIMARY_CLASS}>
          선택한 메뉴 보기
        </button>
      ) : (
        <button type="button" onClick={() => go("cart")} className={REAL_PRIMARY_CLASS}>
          결제하기
          <ChevronRightIcon size={20} />
        </button>
      )}
    </>
  );
}
