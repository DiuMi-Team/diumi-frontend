import { IcedCoffeeIcon } from "@/components/icons/kiosk-icons";
import { ChevronRightIcon, MicIcon } from "@/components/icons/ui-icons";
import { REAL_PRIMARY_CLASS } from "@/components/real/parts";
import type { RealMission } from "@/features/real/missions";

type RealMissionIntroProps = {
  mission: RealMission;
  onStart: () => void;
};

/** 미션 확인 (RCM00) */
export function RealMissionIntro({ mission, onStart }: RealMissionIntroProps) {
  return (
    <>
      <span className="flex items-center gap-1.5 self-start rounded-full bg-gray-2 px-3.5 py-1.5 text-16 font-bold">
        <span className="size-2 flex-none rounded-full bg-primary" aria-hidden="true" />
        미션 수행
      </span>
      <h1 className="text-28 leading-[1.3] font-bold">오늘의 미션</h1>
      <div className="flex items-center gap-3.5 rounded-3xl bg-mint-light px-5 py-[18px] short:py-3 short:[&>svg]:size-12">
        <IcedCoffeeIcon size={60} />
        <span className="flex flex-col gap-1">
          <b className="text-20 leading-[1.4]">{mission.instruction}</b>
          <span className="text-16">결제 방법: {mission.payment}</span>
        </span>
      </div>
      <section
        aria-label="완료 조건"
        className="flex flex-col gap-2.5 rounded-3xl bg-gray-1 px-[18px] py-4 short:gap-1 short:py-2.5"
      >
        <b className="text-17">완료 조건</b>
        <ol className="flex flex-col gap-2 text-17 short:gap-0.5">
          {mission.conditions.map((condition, index) => (
            <li key={condition} className="flex items-center gap-2.5">
              <span className="flex size-[26px] flex-none items-center justify-center rounded-full bg-white text-16 font-bold">
                {index + 1}
              </span>
              {condition}
            </li>
          ))}
        </ol>
      </section>
      <p className="flex items-center gap-2.5 px-1 text-16 leading-[1.45]">
        <span className="flex size-9 flex-none items-center justify-center rounded-full bg-orange">
          <MicIcon size={20} />
        </span>
        <span>
          도움이 필요하면 하단의 <b>음성 도우미</b>를 직접 눌러 주세요.
        </span>
      </p>
      <div className="flex-1" />
      <button type="button" onClick={onStart} className={REAL_PRIMARY_CLASS}>
        미션 시작하기
        <ChevronRightIcon size={20} />
      </button>
    </>
  );
}
