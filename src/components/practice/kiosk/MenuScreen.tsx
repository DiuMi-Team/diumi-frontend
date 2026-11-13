"use client";

import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { groupDim, KIOSK_PRIMARY_CLASS, Spacer } from "@/components/practice/kiosk/parts";
import {
  cartCount,
  cartTotal,
  formatWon,
  itemDetail,
  itemName,
  type CartItem,
} from "@/features/order/order";

/** 메뉴판 (카페 PC03·PC06, 패스트푸드 PE03·PE06 등) */
export function MenuScreen() {
  const { mission, step, order } = usePractice();
  const copy = KIOSK_COPY[mission.service];
  const menuIds = copy.board.items.map((item) => item.id);
  const categoryIds = copy.board.categories.map((category) => `category:${category}`);

  const targetId = step.target.id;
  const board = groupDim(targetId, [...categoryIds, ...menuIds]);
  const tabs = groupDim(targetId, categoryIds);
  const cards = groupDim(targetId, menuIds);
  const isEmpty = order.cart.length === 0;
  /* 메뉴를 고를 차례면 제목을 보이고, 담기를 마치고 결제로 넘어갈 차례면 결제 버튼을 보인다 */
  const choosingMenu = menuIds.includes(targetId);

  return (
    <>
      {choosingMenu && (
        <h2 className="text-22 font-bold">
          {isEmpty ? "메뉴를 선택해 주세요" : "메뉴를 더 담아 보세요"}
        </h2>
      )}
      <section
        aria-label="메뉴판"
        className={`flex flex-col gap-2.5 rounded-3xl bg-gray-1 p-3 short:gap-1.5 short:p-2 ${board.groupClass}`}
      >
        <div className={`flex gap-1.5 ${board.groupClass ? "" : tabs.groupClass}`}>
          {copy.board.categories.map((category) => {
            const selected = category === copy.board.defaultCategory;
            return (
              <KioskButton
                key={category}
                id={`category:${category}`}
                pressed={selected}
                inactiveClassName={board.groupClass ? "" : tabs.itemInactiveClass}
                className={`relative flex h-10 min-w-0 flex-1 items-center justify-center rounded-full text-16 font-bold whitespace-nowrap after:absolute after:inset-x-0 after:-inset-y-1 ${
                  selected ? "bg-primary text-white-pure" : "bg-white"
                }`}
              >
                {category}
              </KioskButton>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {copy.board.items.map((item) => (
            <KioskButton
              key={item.id}
              id={item.id}
              tight
              inactiveClassName={board.groupClass ? "" : cards.itemInactiveClass}
              ariaLabel={`${item.name} ${formatWon(item.price)}`}
              className="flex h-[132px] flex-col items-center justify-center rounded-[20px] bg-white short:h-24 short:[&>svg]:size-9"
            >
              {item.icon(56)}
              <b className="text-17">{item.name}</b>
              <span className="text-16 text-text-sub">{formatWon(item.price)}</span>
            </KioskButton>
          ))}
        </div>
      </section>
      <CartSummary cart={order.cart} />
      {!isEmpty && !choosingMenu && (
        <>
          <Spacer />
          <KioskButton id="menu:checkout" className={KIOSK_PRIMARY_CLASS}>
            {copy.checkout.label}
            {copy.checkout.chevron && <ChevronRightIcon size={20} />}
          </KioskButton>
        </>
      )}
    </>
  );
}

function CartSummary({ cart }: { cart: CartItem[] }) {
  const boxClass =
    "flex items-center justify-between gap-2.5 rounded-[20px] border-2 border-dashed border-gray-2 px-4 py-3 short:py-1.5";

  if (cart.length === 0) {
    return (
      <div className={`${boxClass} text-16 opacity-45`}>
        <span>담은 메뉴</span>
        <b>
          {cartCount(cart)}개 · {formatWon(0)}
        </b>
      </div>
    );
  }

  return (
    <div className={boxClass}>
      <span className="flex flex-col text-16 leading-[1.45]">
        <span className="font-bold text-text-sub">담은 메뉴</span>
        {cart.map((item, index) => (
          <span key={index}>
            {/* 버거는 "불고기버거 단품"처럼 이름에 구성이 들어 있어 설명을 붙이지 않는다 */}
            {itemName(item)}
            {item.type === "drink" && ` ${itemDetail(item, { short: true })}`} × {item.quantity}
          </span>
        ))}
      </span>
      <b className="text-17 whitespace-nowrap">{formatWon(cartTotal(cart))}</b>
    </div>
  );
}
