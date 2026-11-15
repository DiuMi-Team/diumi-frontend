"use client";

import { useState, type ReactNode } from "react";
import { HotIcon, IceIcon } from "@/components/icons/kiosk-icons";
import { Spacer } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import { OptionLabel, REAL_PRIMARY_CLASS, SelectTile, Stepper } from "@/components/real/parts";
import { getCafeMenu, SIZE_LABEL, SIZE_MENUS, type Temperature } from "@/features/cafe/catalog";
import { formatWon, freeOptionSummaries, paidOptionsSummary } from "@/features/order/order";

const TEMPERATURES: { value: Temperature; label: string; icon: ReactNode }[] = [
  { value: "hot", label: "HOT", icon: <HotIcon size={30} /> },
  { value: "ice", label: "ICE", icon: <IceIcon size={30} /> },
];

/** 음료 옵션 (RCM03). 온도를 골라야 장바구니에 담을 수 있다 */
export function RealOptionsScreen() {
  const { order, act, go } = useReal();
  const [needTemperature, setNeedTemperature] = useState(false);
  const draft = order.draft;
  if (draft?.type !== "drink") return null;

  const paid = paidOptionsSummary(draft.paidOptions);
  const free = freeOptionSummaries(draft.freeOptions).join(", ");

  const confirm = () => {
    if (!draft.temperature) {
      setNeedTemperature(true);
      return;
    }
    act({ type: "addDraftToCart" }, "options:confirm");
    go("menu");
  };

  return (
    <>
      <h2 className="mt-1 text-22 font-bold short:mt-0">{getCafeMenu(draft.menuId).name} 옵션</h2>
      <div className="flex h-[58px] items-center justify-between rounded-[18px] bg-gray-1 pr-3 pl-[18px] text-18 font-bold short:h-12">
        수량
        <Stepper
          value={draft.quantity}
          label="수량"
          onChange={(value) => act({ type: "setQuantity", value }, `quantity:${value}`)}
        />
      </div>

      <div role="group" aria-label="온도" className="flex flex-col gap-2.5 short:gap-1">
        <OptionLabel>온도</OptionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {TEMPERATURES.map(({ value, label, icon }) => (
            <SelectTile
              key={value}
              selected={draft.temperature === value}
              onClick={() => {
                setNeedTemperature(false);
                act({ type: "setTemperature", value }, `temperature:${value}`);
              }}
              className="h-[66px] gap-2 text-18 short:h-14"
            >
              {icon}
              {label}
            </SelectTile>
          ))}
        </div>
      </div>

      <div role="group" aria-label="사이즈" className="flex flex-col gap-2.5 short:gap-1">
        <OptionLabel>사이즈</OptionLabel>
        <div className="grid grid-cols-2 gap-2.5">
          {SIZE_MENUS[order.sizeMenu].map((option, index) => (
            <SelectTile
              key={option.id}
              selected={draft.size === option.id}
              onClick={() => act({ type: "setSize", value: option.id }, `size:${option.id}`)}
              className="h-14 gap-1.5 text-18 short:h-12"
            >
              {SIZE_LABEL[option.id]}
              <span className="text-16 font-medium text-text-sub">
                {index === 0 ? "기본" : `+${formatWon(option.extra)}`}
              </span>
            </SelectTile>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <ExtraButton title="유료 옵션" chosen={paid} onClick={() => go("paidOptions")} />
        <ExtraButton title="무료 옵션" chosen={free} onClick={() => go("freeOptions")} />
      </div>

      {needTemperature && (
        <p role="alert" className="text-center text-16 font-bold text-error-text">
          온도를 먼저 골라 주세요. HOT 또는 ICE를 누르면 돼요.
        </p>
      )}
      <Spacer />
      <button type="button" onClick={confirm} className={REAL_PRIMARY_CLASS}>
        선택 완료
      </button>
    </>
  );
}

/** 유료·무료 옵션으로 가는 칸. 고른 옵션이 있으면 그 내용을 보여 준다 */
function ExtraButton({
  title,
  chosen,
  onClick,
}: {
  title: string;
  chosen: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-14 flex-col items-center justify-center rounded-[18px] bg-gray-1 px-2 py-1.5 text-17 font-bold short:min-h-12"
    >
      <span>
        {title} <span className="text-primary">{chosen ? "변경 ›" : "추가 ›"}</span>
      </span>
      {chosen && <span className="text-16 font-medium text-text-sub">{chosen}</span>}
    </button>
  );
}
