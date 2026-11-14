"use client";

import type { ReactNode } from "react";
import { BurgerIcon, SetMealIcon } from "@/components/icons/kiosk-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import { groupDim, KIOSK_PRIMARY_CLASS, Spacer } from "@/components/practice/kiosk/parts";
import { getSetDrink, getSide, SINGLE_CONTENTS } from "@/features/fastfood/catalog";
import { formatWon, itemName, itemPrice } from "@/features/order/order";

const QUANTITY_IDS = ["quantity:decrease", "quantity:increase"];

/** 장바구니에 담기 전 선택한 버거 확인 (PE05, PB08 등) */
export function BurgerConfirmScreen() {
  const { step, order } = usePractice();
  const draft = order.draft;
  if (draft?.type !== "burger" || draft.set === null) {
    throw new Error(`${step.id}: 확인할 버거 구성이 없어요. 미션 데이터를 확인해 주세요`);
  }
  const quantity = groupDim(step.target.id, QUANTITY_IDS);

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
            <InfoRow label="사이드" value={`${getSide(draft.side).name} ›`} />
            <InfoRow label="음료" value={`${getSetDrink(draft.drink).name} ›`} />
          </>
        ) : (
          <InfoRow label="구성" value={SINGLE_CONTENTS} />
        )}
        <div className="flex h-[60px] items-center justify-between border-t-2 border-white text-17 short:h-[52px]">
          <span>수량</span>
          <span className={`flex items-center gap-3 ${quantity.groupClass}`}>
            <StepperButton
              id="quantity:decrease"
              label="수량 줄이기"
              inactive={quantity.itemInactiveClass}
            >
              −
            </StepperButton>
            <b className="text-19" aria-label={`수량 ${draft.quantity}개`}>
              {draft.quantity}개
            </b>
            <StepperButton
              id="quantity:increase"
              label="수량 늘리기"
              inactive={quantity.itemInactiveClass}
            >
              ＋
            </StepperButton>
          </span>
        </div>
      </div>
      <div className="flex justify-between rounded-[20px] border-2 border-gray-1 px-4 py-3.5 text-20 font-bold short:py-2.5">
        <span>금액</span>
        <span>{formatWon(itemPrice(draft))}</span>
      </div>
      <Spacer />
      <KioskButton id="burger:addToCart" className={KIOSK_PRIMARY_CLASS}>
        장바구니 담기
      </KioskButton>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-[52px] items-center justify-between border-t-2 border-white text-17 short:h-12">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

/** 보이는 크기는 디자인의 40px이고, 터치 영역만 48px로 넓힌다 */
function StepperButton({
  id,
  label,
  inactive,
  children,
}: {
  id: string;
  label: string;
  inactive: string;
  children: ReactNode;
}) {
  return (
    <KioskButton
      id={id}
      tight
      ariaLabel={label}
      inactiveClassName={inactive}
      className="relative flex size-10 items-center justify-center rounded-full bg-white text-24 text-primary after:absolute after:-inset-1"
    >
      {children}
    </KioskButton>
  );
}
