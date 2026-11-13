"use client";

import { BurgerIcon, SetMealIcon } from "@/components/icons/kiosk-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import { ScreenHeading } from "@/components/practice/kiosk/parts";
import { getBurger, SET_CONTENTS, SINGLE_CONTENTS } from "@/features/fastfood/catalog";
import { formatWon } from "@/features/order/order";

const CHOICE_CLASS =
  "flex h-44 w-full flex-col items-center justify-center gap-1.5 rounded-[28px] bg-gray-1 short:h-[124px] short:gap-1";

/** 세트/단품 선택 (PE04, PB04) */
export function SetChoiceScreen() {
  const { step, order } = usePractice();
  const draft = order.draft;
  if (draft?.type !== "burger") {
    throw new Error(`${step.id}: 세트/단품을 고를 버거가 없어요. 미션 데이터를 확인해 주세요`);
  }
  const burger = getBurger(draft.menuId);

  return (
    <>
      <ScreenHeading title="어떤 구성으로 드시나요?" sub={burger.name} />
      <KioskButton
        id="set:set"
        ariaLabel={`세트, ${SET_CONTENTS}, ${formatWon(burger.setPrice)}`}
        className={`${CHOICE_CLASS} short:[&>svg]:w-24`}
      >
        <SetMealIcon burgerId={burger.id} width={112} />
        <b className="text-22">세트</b>
        <span className="text-16 text-text-sub">
          {SET_CONTENTS} · {formatWon(burger.setPrice)}
        </span>
      </KioskButton>
      <KioskButton
        id="set:single"
        ariaLabel={`단품, ${SINGLE_CONTENTS}, ${formatWon(burger.price)}`}
        className={`${CHOICE_CLASS} short:[&>svg]:size-12`}
      >
        <BurgerIcon burgerId={burger.id} size={60} />
        <b className="text-22">단품</b>
        <span className="text-16 text-text-sub">
          {SINGLE_CONTENTS} · {formatWon(burger.price)}
        </span>
      </KioskButton>
      <p className="rounded-[18px] bg-gray-1 px-4 py-3 text-16 leading-[1.45] opacity-80 short:py-2">
        세트의 사이드와 음료는 다음 화면에서 바꿀 수 있어요.
      </p>
    </>
  );
}
