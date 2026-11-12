"use client";

import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { MenuIcon } from "@/components/icons/kiosk-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import { groupDim, KIOSK_PRIMARY_CLASS, Spacer } from "@/components/practice/cafe/parts";
import {
  CAFE_CATEGORIES,
  CAFE_MENUS,
  DEFAULT_CATEGORY,
  getCafeMenu,
} from "@/features/cafe/catalog";
import {
  cartCount,
  cartTotal,
  formatWon,
  itemOptionLabel,
  type CartItem,
} from "@/features/order/order";

const MENU_IDS = CAFE_MENUS.map((menu) => `menu:${menu.id}`);
const CATEGORY_IDS = CAFE_CATEGORIES.map((category) => `category:${category}`);

export function MenuScreen() {
  const { step, order } = usePractice();
  const targetId = step.target.id;
  const board = groupDim(targetId, [...CATEGORY_IDS, ...MENU_IDS]);
  const tabs = groupDim(targetId, CATEGORY_IDS);
  const cards = groupDim(targetId, MENU_IDS);
  const isEmpty = order.cart.length === 0;

  return (
    <>
      {isEmpty && <h2 className="text-22 font-bold">메뉴를 선택해 주세요</h2>}
      <section
        aria-label="메뉴판"
        className={`flex flex-col gap-2.5 rounded-3xl bg-gray-1 p-3 ${board.groupClass}`}
      >
        <div className={`flex gap-1.5 ${board.groupClass ? "" : tabs.groupClass}`}>
          {CAFE_CATEGORIES.map((category) => {
            const selected = category === DEFAULT_CATEGORY;
            return (
              <KioskButton
                key={category}
                id={`category:${category}`}
                pressed={selected}
                inactiveClassName={board.groupClass ? "" : tabs.itemInactiveClass}
                className={`relative flex h-10 flex-1 items-center justify-center rounded-full text-16 font-bold after:absolute after:inset-x-0 after:-inset-y-1 ${
                  selected ? "bg-primary text-white-pure" : "bg-white"
                }`}
              >
                {category}
              </KioskButton>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {CAFE_MENUS.map((menu) => (
            <KioskButton
              key={menu.id}
              id={`menu:${menu.id}`}
              tight
              inactiveClassName={board.groupClass ? "" : cards.itemInactiveClass}
              ariaLabel={`${menu.name} ${formatWon(menu.price)}`}
              className="flex h-[132px] flex-col items-center justify-center rounded-[20px] bg-white"
            >
              <MenuIcon menuId={menu.id} size={56} />
              <b className="text-17">{menu.name}</b>
              <span className="text-16 text-text-sub">{formatWon(menu.price)}</span>
            </KioskButton>
          ))}
        </div>
      </section>
      <CartSummary cart={order.cart} />
      {!isEmpty && (
        <>
          <Spacer />
          <KioskButton id="menu:checkout" className={KIOSK_PRIMARY_CLASS}>
            결제하기
            <ChevronRightIcon size={20} />
          </KioskButton>
        </>
      )}
    </>
  );
}

function CartSummary({ cart }: { cart: CartItem[] }) {
  const boxClass =
    "flex items-center justify-between gap-2.5 rounded-[20px] border-2 border-dashed border-gray-2 px-4 py-3";

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
            {getCafeMenu(item.menuId).name} {itemOptionLabel(item)} × {item.quantity}
          </span>
        ))}
      </span>
      <b className="text-17 whitespace-nowrap">{formatWon(cartTotal(cart))}</b>
    </div>
  );
}
