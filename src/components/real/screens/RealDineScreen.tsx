"use client";

import { DineInIcon, TakeoutIcon } from "@/components/icons/kiosk-icons";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { useReal } from "@/components/real/RealContext";
import type { DineOption } from "@/features/order/order";

const OPTION_CLASS =
  "flex h-[196px] w-full flex-none flex-col items-center justify-center gap-3 rounded-[28px] bg-gray-1 text-22 font-bold short:h-[136px] short:gap-1.5 short:[&>svg]:size-16";

/** 매장·포장 선택 (RCM01) */
export function RealDineScreen() {
  const { mission, act, go } = useReal();
  const { title, sub } = KIOSK_COPY[mission.service].dine;

  const choose = (value: DineOption) => {
    act({ type: "setDineOption", value }, `dine:${value}`);
    go("menu");
  };

  return (
    <>
      <div>
        <h2 className="text-24 font-bold">{title}</h2>
        <p className="mt-1 text-16 text-text-sub">{sub}</p>
      </div>
      <button type="button" onClick={() => choose("dineIn")} className={OPTION_CLASS}>
        <DineInIcon size={84} />
        매장에서 먹어요
      </button>
      <button type="button" onClick={() => choose("takeout")} className={OPTION_CLASS}>
        <TakeoutIcon size={84} />
        포장해서 갈래요
      </button>
    </>
  );
}
