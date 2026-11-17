"use client";

import { DineInIcon, TakeoutIcon } from "@/components/icons/kiosk-icons";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { useReal } from "@/components/real/RealContext";
import type { DineOption } from "@/features/order/order";

const OPTION_CLASS =
  "flex h-[196px] w-full flex-none flex-col items-center justify-center gap-3 rounded-[28px] bg-gray-1 text-22 font-bold short:h-[136px] short:gap-1.5 short:[&>svg]:size-16";

/** 매장·포장 선택 (RCM01) */
/** 실전 패스트푸드 키오스크의 문구 (RBM01, RBF01) */
const FASTFOOD_REAL_LABELS = { dineIn: "매장에서 먹기", takeout: "포장해서 가져가기" };
const CAFE_REAL_LABELS = { dineIn: "매장에서 먹어요", takeout: "포장해서 갈래요" };

export function RealDineScreen() {
  const { setup, act, go } = useReal();
  const isFastfood = setup.service === "fastfood";
  const title = KIOSK_COPY[setup.service].dine.title;
  const sub =
    isFastfood && setup.mission
      ? "패스트푸드는 주문 전에 먼저 선택해요"
      : KIOSK_COPY[setup.service].dine.sub;
  const labels = isFastfood ? FASTFOOD_REAL_LABELS : CAFE_REAL_LABELS;

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
        {labels.dineIn}
      </button>
      <button type="button" onClick={() => choose("takeout")} className={OPTION_CLASS}>
        <TakeoutIcon size={84} />
        {labels.takeout}
      </button>
    </>
  );
}
