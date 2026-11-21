"use client";

import { useState } from "react";
import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { KIOSK_COPY, type BoardItem } from "@/components/practice/kiosk/copy";
import { Spacer } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import { REAL_PRIMARY_CLASS, RealBottomBar } from "@/components/real/parts";
import type { CafeMenuId } from "@/features/cafe/catalog";
import type { BurgerId } from "@/features/fastfood/catalog";
import { cartCount, cartTotal, formatWon, itemName } from "@/features/order/order";
import { realDrinkName } from "@/features/real/labels";

/** 실전 패스트푸드 키오스크의 세로 분류 (RBM02) */
const FASTFOOD_REAL_CATEGORIES = ["추천", "버거", "치킨", "사이드", "음료", "디저트"];

/**
 * 메뉴판. 장바구니가 차 있으면 "메뉴를 더 담아(골라) 보세요"와 결제 버튼.
 * - 카페 (RCM02, RCM06): 위쪽 가로 분류
 * - 패스트푸드 (RBM02, RBM06): 왼쪽 세로 분류
 */
export function RealMenuScreen() {
  const { setup, order, act, go } = useReal();
  const [hint, setHint] = useState(false);
  const copy = KIOSK_COPY[setup.service];
  const isCafe = setup.service === "cafe";
  const isEmpty = order.cart.length === 0;

  const pick = (item: BoardItem) => {
    const id = item.id.replace("menu:", "");
    if (isCafe) {
      act({ type: "selectMenu", menuId: id as CafeMenuId }, item.id);
      go("options");
    } else {
      act({ type: "selectBurger", menuId: id as BurgerId }, item.id);
      go("setChoice");
    }
  };

  const summaryLabel = isCafe ? "담은 메뉴" : "주문 내역";

  return (
    <>
      <div>
        <h2 className="text-22 font-bold">
          {isEmpty ? "메뉴를 선택해 주세요" : copy.board.moreTitle}
        </h2>
        {!isEmpty && isCafe && (
          <p className="mt-0.5 text-16 text-text-sub">선택한 음료가 아래 장바구니에 담겼어요</p>
        )}
      </div>

      {isCafe ? (
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
                  category === copy.board.defaultCategory
                    ? "bg-primary text-white-pure"
                    : "bg-white"
                }`}
              >
                {category}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {copy.board.items.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onClick={() => pick(item)}
                className={isEmpty ? "h-[124px] short:h-24" : "h-28 short:h-[88px]"}
              />
            ))}
          </div>
        </section>
      ) : (
        <section aria-label="메뉴판" className="flex gap-2.5 rounded-3xl bg-gray-1 p-3 short:p-2">
          {/* 버거 분류만 열려 있어 분류는 보여 주기만 한다 */}
          <div className="flex w-[76px] flex-none flex-col gap-1.5" aria-hidden="true">
            {FASTFOOD_REAL_CATEGORIES.map((category, index) => (
              <span
                key={category}
                className={`flex h-10 items-center justify-center rounded-[14px] text-16 font-bold short:h-9 ${
                  index === 0 ? "bg-primary text-white-pure" : "bg-white"
                }`}
              >
                {category}
              </span>
            ))}
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-2 content-start gap-2">
            {copy.board.items.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onClick={() => pick(item)}
                iconSize={52}
                className="h-[130px] rounded-[18px] whitespace-nowrap short:h-[118px]"
              />
            ))}
          </div>
        </section>
      )}

      <div className="flex items-center justify-between gap-2.5 rounded-[20px] border-2 border-dashed border-gray-2 px-4 py-3 short:py-1.5">
        {isEmpty ? (
          <>
            <span className="text-16 text-text-sub">{summaryLabel}</span>
            <b className="text-16 text-text-sub">
              {cartCount(order.cart)}개 · {formatWon(0)}
            </b>
          </>
        ) : (
          <>
            <span className="flex flex-col text-16 leading-[1.45]">
              <span className="font-bold text-text-sub">{summaryLabel}</span>
              {order.cart.map((item, index) => (
                <span key={index}>
                  {item.type === "drink" ? realDrinkName(item) : itemName(item)} × {item.quantity}
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
      <RealBottomBar>
        {isEmpty ? (
          <button type="button" onClick={() => setHint(true)} className={REAL_PRIMARY_CLASS}>
            선택한 메뉴 보기
          </button>
        ) : (
          <button
            type="button"
            onClick={() => go(isCafe ? "cart" : "orderReview")}
            className={REAL_PRIMARY_CLASS}
          >
            {copy.checkout.label}
            {copy.checkout.chevron && <ChevronRightIcon size={20} />}
          </button>
        )}
      </RealBottomBar>
    </>
  );
}

function MenuCard({
  item,
  onClick,
  className,
  iconSize = 56,
}: {
  item: BoardItem;
  onClick: () => void;
  className: string;
  iconSize?: number;
}) {
  return (
    <button
      type="button"
      aria-label={`${item.name} ${formatWon(item.price)}`}
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-[20px] bg-white short:[&>svg]:size-9 ${className}`}
    >
      {item.icon(iconSize)}
      <b className="text-17">{item.name}</b>
      <span className="text-16 text-text-sub">{formatWon(item.price)}</span>
    </button>
  );
}
