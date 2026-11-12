import { ClockIcon, GuideBookIcon } from "@/components/icons/kiosk-icons";
import { ChevronRightIcon, HandIcon } from "@/components/icons/ui-icons";
import type { PracticeMission } from "@/features/practice/types";

type MissionIntroProps = {
  mission: PracticeMission;
  onStart: () => void;
};

/** 오늘의 미션 (PC01 등) */
export function MissionIntro({ mission, onStart }: MissionIntroProps) {
  return (
    <main className="flex flex-1 flex-col gap-3.5 px-5 pt-5 pb-4">
      <h1 className="text-28 leading-[1.3] font-bold">오늘의 미션</h1>
      <ol className="flex flex-col gap-3.5 rounded-3xl bg-mint-light p-[18px]">
        {mission.intro.items.map((item, index) => (
          <li key={item.title} className="flex gap-3">
            <span className="flex size-8 flex-none items-center justify-center rounded-full bg-white text-17 font-bold">
              {index + 1}
            </span>
            <span className="flex flex-col">
              <b className="text-19 leading-8">{item.title}</b>
              {item.detail && <span className="text-16">{item.detail}</span>}
            </span>
          </li>
        ))}
      </ol>
      <ul className="flex flex-col gap-3 rounded-3xl bg-gray-1 px-[18px] py-4 text-17">
        <li className="flex items-center gap-3">
          <ClockIcon size={36} />
          예상 시간 약 {mission.intro.estimatedMinutes}분
        </li>
        <li className="flex items-center gap-3">
          <GuideBookIcon size={36} />
          튜토리얼 형식으로 안내해요
        </li>
        <li className="flex items-center gap-3">
          <span className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-white outline-3 outline-orange">
            <HandIcon size={22} />
          </span>
          주황 테두리를 따라 누르면 돼요
        </li>
      </ul>
      <div className="flex-1" />
      <button
        type="button"
        onClick={onStart}
        className="flex h-16 flex-none items-center justify-center gap-2 rounded-full bg-primary text-22 font-bold text-white-pure"
      >
        연습 시작하기
        <ChevronRightIcon size={20} />
      </button>
    </main>
  );
}
