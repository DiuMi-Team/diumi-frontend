"use client";

import { PaidOptionIcon } from "@/components/icons/kiosk-icons";
import { ScreenHeading, Spacer } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import { REAL_PRIMARY_CLASS, RealBottomBar, SelectTile, Stepper } from "@/components/real/parts";
import { PAID_OPTIONS } from "@/features/cafe/catalog";
import { formatWon, itemPrice, paidOptionsPrice } from "@/features/order/order";

/** 유료 옵션 (RCM04). 샷·시럽은 개수를 고르고, 휘핑크림은 넣거나 빼기만 한다 */
export function RealPaidOptionsScreen() {
  const { order, act, back } = useReal();
  const draft = order.draft;
  if (draft?.type !== "drink") return null;

  const extra = paidOptionsPrice(draft.paidOptions);

  return (
    <>
      <ScreenHeading
        title="유료 옵션을 선택해 주세요"
        sub="필요한 옵션만 추가해 주세요. 선택하지 않아도 돼요"
      />
      {PAID_OPTIONS.map((option) => {
        const count = draft.paidOptions[option.id] ?? 0;
        const set = (value: number) =>
          act(
            { type: "setPaidOption", option: option.id, count: value },
            `paid:${option.id}:${value}`,
          );

        if (option.id === "whip") {
          return (
            <SelectTile
              key={option.id}
              selected={count > 0}
              ariaLabel={`${option.name} +${formatWon(option.price)}`}
              onClick={() => set(count > 0 ? 0 : 1)}
              className="h-[62px] justify-start gap-3 pr-[18px] pl-3.5 text-left text-18 short:h-12 short:[&>svg]:size-8"
            >
              <PaidOptionIcon option={option.id} size={36} />
              <span className="flex-1">{option.name}</span>
              <span className="text-16 font-medium">+{formatWon(option.price)}</span>
            </SelectTile>
          );
        }

        return (
          <div
            key={option.id}
            role="group"
            aria-label={option.name}
            className="flex h-[62px] items-center gap-3 rounded-[18px] bg-gray-1 pr-3 pl-3.5 text-18 font-bold short:h-12 short:[&>svg]:size-8"
          >
            <PaidOptionIcon option={option.id} size={36} />
            <span className="flex flex-1 flex-col leading-[1.25]">
              {option.name}
              <span className="text-16 font-medium text-text-sub">+{formatWon(option.price)}</span>
            </span>
            <Stepper value={count} label={option.name} min={0} onChange={set} />
          </div>
        );
      })}
      <div className="flex flex-col gap-1.5 rounded-[18px] border-2 border-gray-1 px-4 py-3 text-16 short:gap-0.5 short:py-2">
        <div className="flex justify-between">
          <span>추가 금액</span>
          <b>{formatWon(extra)}</b>
        </div>
        <div className="flex justify-between text-18 font-bold">
          <span>음료 포함 금액</span>
          <span>{formatWon(itemPrice({ ...draft, quantity: 1 }))}</span>
        </div>
      </div>
      <Spacer />
      <RealBottomBar>
        <button type="button" onClick={back} className={REAL_PRIMARY_CLASS}>
          유료 옵션 선택 완료
        </button>
      </RealBottomBar>
    </>
  );
}
