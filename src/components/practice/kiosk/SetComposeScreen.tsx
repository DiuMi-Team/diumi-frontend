"use client";

import type { ReactNode } from "react";
import { SetDrinkIcon, SideIcon } from "@/components/icons/kiosk-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import { KIOSK_PRIMARY_CLASS, ScreenHeading, Spacer } from "@/components/practice/kiosk/parts";
import {
  DEFAULT_SET_DRINK,
  DEFAULT_SIDE,
  SET_DRINKS,
  SIDES,
  type SetChoice,
} from "@/features/fastfood/catalog";
import { formatWon } from "@/features/order/order";

const TILE_CLASS =
  "flex h-[108px] flex-col items-center justify-center rounded-[18px] text-16 font-bold short:h-[88px] short:[&>svg]:size-9";
const SELECTED_CLASS = "border-3 border-primary bg-white text-primary";

/** 세트 메뉴 구성: 사이드와 음료 고르기 (PB05~PB07) */
export function SetComposeScreen() {
  const { step, order } = usePractice();
  const draft = order.draft;
  if (draft?.type !== "burger" || !draft.set) {
    throw new Error(`${step.id}: 구성할 세트가 없어요. 미션 데이터를 확인해 주세요`);
  }

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
            id={`side:${side.id}`}
            choice={side}
            isDefault={side.id === DEFAULT_SIDE}
            selected={draft.side === side.id}
            icon={<SideIcon sideId={side.id} size={44} />}
          />
        ))}
      </ChoiceGroup>
      <ChoiceGroup label="음료">
        {SET_DRINKS.map((drink) => (
          <ChoiceTile
            key={drink.id}
            id={`drink:${drink.id}`}
            choice={drink}
            isDefault={drink.id === DEFAULT_SET_DRINK}
            selected={draft.drink === drink.id}
            icon={<SetDrinkIcon drinkId={drink.id} size={44} />}
          />
        ))}
      </ChoiceGroup>
      <p className="rounded-[18px] bg-gray-1 px-4 py-3 text-16 leading-[1.45] opacity-80 short:py-2">
        다른 메뉴로 바꾸면 추가 금액이 생길 수 있어요.
      </p>
      <Spacer />
      <KioskButton id="setCompose:confirm" className={KIOSK_PRIMARY_CLASS}>
        선택 완료
      </KioskButton>
    </>
  );
}

function ChoiceGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2.5 short:gap-1">
      <span className="text-16 font-bold text-text-sub short:leading-5">{label}</span>
      <div className="grid grid-cols-3 gap-2.5">{children}</div>
    </div>
  );
}

/** 기본 구성은 "기본", 바꾸면 붙는 금액은 "+500원"처럼 보여 준다 (제로콜라처럼 0원이어도 "+0원") */
function choiceNote(choice: SetChoice<string>, isDefault: boolean) {
  return isDefault ? "기본" : `+${formatWon(choice.extra)}`;
}

function ChoiceTile({
  id,
  choice,
  isDefault,
  selected,
  icon,
}: {
  id: string;
  choice: SetChoice<string>;
  isDefault: boolean;
  selected: boolean;
  icon: ReactNode;
}) {
  const note = choiceNote(choice, isDefault);

  return (
    <KioskButton
      id={id}
      tight
      pressed={selected}
      ariaLabel={`${choice.name} ${note}`}
      inactiveClassName={selected ? "opacity-90" : undefined}
      className={`${TILE_CLASS} ${selected ? SELECTED_CLASS : "bg-gray-1"}`}
    >
      {icon}
      {choice.name}
      <span className={`text-16 font-medium ${selected ? "" : "text-text-sub"}`}>{note}</span>
    </KioskButton>
  );
}
