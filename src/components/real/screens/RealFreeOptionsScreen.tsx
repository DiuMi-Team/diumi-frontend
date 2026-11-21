"use client";

import { ScreenHeading, Spacer } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import {
  OptionLabel,
  REAL_PRIMARY_CLASS,
  RealBottomBar,
  SelectTile,
} from "@/components/real/parts";
import { FREE_OPTIONS } from "@/features/cafe/catalog";

/** 무료 옵션 (RCM05). 고르지 않으면 기본값으로 만든다 */
export function RealFreeOptionsScreen() {
  const { order, act, back } = useReal();
  const draft = order.draft;
  if (draft?.type !== "drink") return null;

  return (
    <>
      <ScreenHeading
        title="무료 옵션을 선택해 주세요"
        sub="취향에 맞게 바꾸거나 기본값으로 진행해요"
      />
      {FREE_OPTIONS.map((group) => (
        <div
          key={group.key}
          role="group"
          aria-label={group.label}
          className="flex flex-col gap-2.5 short:gap-1"
        >
          <OptionLabel>{group.label}</OptionLabel>
          <div
            className={`grid gap-2.5 ${group.choices.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}
          >
            {group.choices.map((choice) => (
              <SelectTile
                key={choice.id}
                selected={draft.freeOptions[group.key] === choice.id}
                onClick={() =>
                  act(
                    { type: "setFreeOption", key: group.key, value: choice.id },
                    `free:${group.key}:${choice.id}`,
                  )
                }
                className="h-[60px] gap-1.5 text-18 short:h-12"
              >
                {choice.name}
                {choice.note && (
                  <span className="text-16 font-medium text-text-sub">{choice.note}</span>
                )}
              </SelectTile>
            ))}
          </div>
        </div>
      ))}
      <Spacer />
      <RealBottomBar>
        <button type="button" onClick={back} className={REAL_PRIMARY_CLASS}>
          무료 옵션 선택 완료
        </button>
      </RealBottomBar>
    </>
  );
}
