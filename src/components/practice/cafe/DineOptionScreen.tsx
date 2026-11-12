import { DineInIcon, TakeoutIcon } from "@/components/icons/kiosk-icons";
import { KioskButton } from "@/components/practice/PracticeContext";

const OPTION_CLASS =
  "flex h-[196px] w-full flex-none flex-col items-center justify-center gap-3 rounded-[28px] bg-gray-1 text-22 font-bold";

export function DineOptionScreen() {
  return (
    <>
      <div>
        <h2 className="mt-1 text-24 font-bold">어떻게 이용하시나요?</h2>
        <p className="mt-1 text-16 text-text-sub">주문을 받을 방법을 먼저 선택해 주세요</p>
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
