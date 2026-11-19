"use client";

import { useState, type ReactNode } from "react";
import { BurgerIcon, SetDrinkIcon, SetMealIcon, SideIcon } from "@/components/icons/kiosk-icons";
import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { ScreenHeading, Spacer } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import {
  OptionLabel,
  REAL_OUTLINE_CLASS,
  REAL_PRIMARY_CLASS,
  RealBottomBar,
  SelectTile,
  Stepper,
} from "@/components/real/parts";
import {
  DEFAULT_SET_DRINK,
  DEFAULT_SIDE,
  getBurger,
  getSetDrink,
  getSide,
  SET_CONTENTS,
  SET_DRINKS,
  SIDES,
  SINGLE_CONTENTS,
  type SetChoice,
} from "@/features/fastfood/catalog";
import {
  cartTotal,
  formatWon,
  itemDetail,
  itemName,
  itemPrice,
  payableTotal,
  type DineOption,
  type OrderState,
} from "@/features/order/order";

/* 실전 패스트푸드 전용 화면 (RBM03~RBM07, RBF03~RBF07). 강조 없이 스스로 고른다 */

const DINE_LABEL: Record<DineOption, string> = { dineIn: "매장", takeout: "포장" };

const CHOICE_CLASS =
  "flex h-44 w-full flex-col items-center justify-center gap-1.5 rounded-[28px] bg-gray-1 short:h-[124px] short:gap-1";

function useBurgerDraft(screen: string) {
  const { order } = useReal();
  const draft = order.draft;
  if (draft?.type !== "burger") {
    throw new Error(`${screen}: 고른 버거가 없어요. 메뉴판에서 버거를 먼저 골라야 해요`);
  }
  return draft;
}

/** 세트/단품 선택 (RBM03, RBF03) */
export function RealSetChoiceScreen() {
  const { act, go } = useReal();
  const burger = getBurger(useBurgerDraft("setChoice").menuId);

  const choose = (set: boolean) => {
    act({ type: "chooseSet", set }, set ? "set:set" : "set:single");
    go(set ? "setCompose" : "burgerConfirm");
  };

  return (
    <>
      <ScreenHeading title="어떤 구성으로 드시나요?" sub={burger.name} />
      <button
        type="button"
        aria-label={`세트, ${SET_CONTENTS}, ${formatWon(burger.setPrice)}`}
        onClick={() => choose(true)}
        className={`${CHOICE_CLASS} short:[&>svg]:w-24`}
      >
        <SetMealIcon burgerId={burger.id} width={112} />
        <b className="text-22">세트</b>
        <span className="text-16 text-text-sub">
          {SET_CONTENTS} · {formatWon(burger.setPrice)}
        </span>
      </button>
      <button
        type="button"
        aria-label={`단품, ${SINGLE_CONTENTS}, ${formatWon(burger.price)}`}
        onClick={() => choose(false)}
        className={`${CHOICE_CLASS} short:[&>svg]:size-12`}
      >
        <BurgerIcon burgerId={burger.id} size={60} />
        <b className="text-22">단품</b>
        <span className="text-16 text-text-sub">
          {SINGLE_CONTENTS} · {formatWon(burger.price)}
        </span>
      </button>
      <p className="rounded-[18px] bg-gray-1 px-4 py-3 text-16 leading-[1.45] opacity-80 short:py-2">
        세트의 사이드와 음료는 다음 화면에서 바꿀 수 있어요.
      </p>
    </>
  );
}

/** 세트 구성: 사이드와 음료를 하나씩 고른다 (RBM04, RBF04). 처음에는 아무것도 고르지 않은 상태다 */
export function RealSetComposeScreen() {
  const { act, go } = useReal();
  const draft = useBurgerDraft("setCompose");
  const [hint, setHint] = useState(false);

  const confirm = () => {
    if (!draft.side || !draft.drink) {
      setHint(true);
      return;
    }
    go("burgerConfirm");
  };

  return (
    <>
      <ScreenHeading
        title="세트 메뉴를 구성해 주세요"
        sub="사이드 메뉴와 음료를 하나씩 선택해 주세요"
      />
      <ChoiceGroup label="사이드 메뉴">
        {SIDES.map((side) => (
          <ChoiceTile
            key={side.id}
            choice={side}
            isDefault={side.id === DEFAULT_SIDE}
            selected={draft.side === side.id}
            icon={<SideIcon sideId={side.id} size={44} />}
            onClick={() => act({ type: "setSide", value: side.id }, `side:${side.id}`)}
          />
        ))}
      </ChoiceGroup>
      <ChoiceGroup label="음료">
        {SET_DRINKS.map((drink) => (
          <ChoiceTile
            key={drink.id}
            choice={drink}
            isDefault={drink.id === DEFAULT_SET_DRINK}
            selected={draft.drink === drink.id}
            icon={<SetDrinkIcon drinkId={drink.id} size={44} />}
            onClick={() => act({ type: "setSetDrink", value: drink.id }, `drink:${drink.id}`)}
          />
        ))}
      </ChoiceGroup>
      <p className="rounded-[18px] bg-gray-1 px-4 py-3 text-16 leading-[1.45] opacity-80 short:py-2">
        다른 메뉴로 바꾸면 추가 금액이 생길 수 있어요.
      </p>
      {hint && (!draft.side || !draft.drink) && (
        <p role="alert" className="text-center text-16 font-bold text-error-text">
          {draft.side ? "음료" : draft.drink ? "사이드 메뉴" : "사이드 메뉴와 음료"}를 골라 주세요.
        </p>
      )}
      <Spacer />
      <RealBottomBar>
        <button type="button" onClick={confirm} className={REAL_PRIMARY_CLASS}>
          선택 완료
        </button>
      </RealBottomBar>
    </>
  );
}

function ChoiceGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2.5 short:gap-1">
      <OptionLabel>{label}</OptionLabel>
      <div className="grid grid-cols-3 gap-2.5">{children}</div>
    </div>
  );
}

function ChoiceTile({
  choice,
  isDefault,
  selected,
  icon,
  onClick,
}: {
  choice: SetChoice<string>;
  isDefault: boolean;
  selected: boolean;
  icon: ReactNode;
  onClick: () => void;
}) {
  /* 기본 구성은 "기본", 바꾸면 붙는 금액은 "+500원"처럼 (제로콜라처럼 0원이어도 "+0원") */
  const note = isDefault ? "기본" : `+${formatWon(choice.extra)}`;
  return (
    <SelectTile
      selected={selected}
      onClick={onClick}
      ariaLabel={`${choice.name} ${note}`}
      className="h-[108px] flex-col text-16 short:h-[88px] short:[&>svg]:size-9"
    >
      {icon}
      {choice.name}
      <span className={`text-16 font-medium ${selected ? "" : "text-text-sub"}`}>{note}</span>
    </SelectTile>
  );
}

/** 장바구니에 담기 전 확인 (RBM05, RBF05). 사이드·음료를 누르면 구성 화면으로 돌아간다 */
export function RealBurgerConfirmScreen() {
  const { act, go, back } = useReal();
  const draft = useBurgerDraft("burgerConfirm");
  if (draft.set === null) throw new Error("burgerConfirm: 세트/단품을 먼저 골라야 해요");

  return (
    <>
      <h2 className="mt-0.5 text-22 font-bold">선택한 메뉴를 확인해 주세요</h2>
      <div className="flex flex-col rounded-3xl bg-gray-1 px-[18px] pt-3.5 pb-2 short:pt-2.5 short:pb-1">
        <div className="flex items-center gap-3 pb-2.5 short:pb-1.5">
          {draft.set ? (
            <SetMealIcon burgerId={draft.menuId} width={84} />
          ) : (
            <BurgerIcon burgerId={draft.menuId} size={52} shadow={false} />
          )}
          <b className="text-20">{itemName(draft)}</b>
        </div>
        {draft.set && draft.side && draft.drink ? (
          <>
            <InfoRow label="사이드" value={getSide(draft.side).name} onClick={back} />
            <InfoRow label="음료" value={getSetDrink(draft.drink).name} onClick={back} />
          </>
        ) : (
          <InfoRow label="구성" value={SINGLE_CONTENTS} />
        )}
        <div className="flex h-[60px] items-center justify-between border-t-2 border-white text-17 short:h-[52px]">
          <span>수량</span>
          <Stepper
            value={draft.quantity}
            unit="개"
            label="수량"
            onChange={(value) => act({ type: "setQuantity", value }, `quantity:${value}`)}
          />
        </div>
      </div>
      <div className="flex justify-between rounded-[20px] border-2 border-gray-1 px-4 py-3.5 text-20 font-bold short:py-2.5">
        <span>금액</span>
        <span>{formatWon(itemPrice(draft))}</span>
      </div>
      <Spacer />
      <RealBottomBar>
        <button
          type="button"
          onClick={() => {
            act({ type: "addDraftToCart" }, "burger:addToCart");
            go("menu");
          }}
          className={REAL_PRIMARY_CLASS}
        >
          장바구니 담기
        </button>
      </RealBottomBar>
    </>
  );
}

function InfoRow({
  label,
  value,
  onClick,
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  const row =
    "flex h-[52px] w-full items-center justify-between border-t-2 border-white text-17 short:h-12";
  if (!onClick) {
    return (
      <div className={row}>
        <span>{label}</span>
        <b>{value}</b>
      </div>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-label={`${label} ${value} 바꾸기`} className={row}>
      <span>{label}</span>
      <b>{value} ›</b>
    </button>
  );
}

/** 주문 확인 (RBM07, RBF07). 여기서도 수량을 바꿀 수 있다 */
export function RealOrderReviewScreen() {
  const { order, act, go } = useReal();
  const copy = KIOSK_COPY.fastfood.review;

  return (
    <>
      <ScreenHeading title="주문 내역을 확인해 주세요" />
      <ul aria-label="주문 내역" className="flex flex-col gap-2.5">
        {order.cart.map((item, index) =>
          item.type === "burger" ? (
            <li
              key={index}
              className="flex flex-col gap-3 rounded-3xl bg-gray-1 px-[18px] py-4 short:gap-2 short:py-3"
            >
              <div className="flex items-center gap-3">
                {item.set ? (
                  <SetMealIcon burgerId={item.menuId} width={64} />
                ) : (
                  <BurgerIcon burgerId={item.menuId} size={52} shadow={false} />
                )}
                <span className="flex flex-1 flex-col">
                  <b className="text-19">
                    {itemName(item)} × {item.quantity}
                  </b>
                  <span className="text-16 text-text-sub">{itemDetail(item)}</span>
                </span>
              </div>
              <div className="flex items-center justify-between border-t-2 border-white pt-3 text-18 font-bold short:pt-2">
                <span>수량</span>
                <Stepper
                  value={item.quantity}
                  unit="개"
                  label={`${itemName(item)} 수량`}
                  onChange={(value) =>
                    act({ type: "setCartQuantity", index, value }, `cart:${index}:${value}`)
                  }
                />
              </div>
            </li>
          ) : null,
        )}
      </ul>
      <ReviewTotals order={order} />
      <Spacer />
      <button type="button" onClick={() => go("menu")} className={REAL_OUTLINE_CLASS}>
        {copy.addMore}
      </button>
      <RealBottomBar>
        <button type="button" onClick={() => go("paymentMethod")} className={REAL_PRIMARY_CLASS}>
          {copy.next}
          <ChevronRightIcon size={20} />
        </button>
      </RealBottomBar>
    </>
  );
}

function ReviewTotals({ order }: { order: OrderState }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-[20px] border-2 border-gray-1 px-4 py-3 text-16 short:gap-0.5 short:py-2">
      <div className="flex justify-between">
        <span>이용 방법</span>
        <b>{order.dineOption ? DINE_LABEL[order.dineOption] : "-"}</b>
      </div>
      <div className="flex justify-between">
        <span>주문 금액</span>
        <span>{formatWon(cartTotal(order.cart))}</span>
      </div>
      <div className="flex justify-between text-20 font-bold">
        <span>결제 금액</span>
        <span>{formatWon(payableTotal(order))}</span>
      </div>
    </div>
  );
}
