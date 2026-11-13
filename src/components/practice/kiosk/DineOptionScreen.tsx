"use client";

import { DineInIcon, TakeoutIcon } from "@/components/icons/kiosk-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";

const OPTION_CLASS =
  "flex h-[196px] w-full flex-none flex-col items-center justify-center gap-3 rounded-[28px] bg-gray-1 text-22 font-bold short:h-[136px] short:gap-1.5 short:[&>svg]:size-16";

export function DineOptionScreen() {
  const { mission } = usePractice();
  const { title, sub } = KIOSK_COPY[mission.service].dine;

  return (
    <>
      <div>
        <h2 className="mt-1 text-24 font-bold short:mt-0">{title}</h2>
        <p className="mt-1 text-16 text-text-sub">{sub}</p>
      </div>
      <KioskButton id="dine:dineIn" className={OPTION_CLASS}>
        <DineInIcon size={84} />
        매장에서 먹어요
      </KioskButton>
      <KioskButton id="dine:takeout" className={OPTION_CLASS}>
        <TakeoutIcon size={84} />
        포장해서 갈래요
      </KioskButton>
    </>
  );
}
