import Link from "next/link";
import { CheckIcon, ChevronRightIcon } from "@/components/icons/ui-icons";
import type { PracticeMission } from "@/features/practice/types";

/** 연습 완료 (PC12 등) */
export function MissionComplete({ mission }: { mission: PracticeMission }) {
  const buttonClass =
    "flex h-16 flex-none items-center justify-center gap-2 rounded-full text-22 font-bold short:h-14";

  return (
    <main className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto *:shrink-0 px-5 pt-8 pb-5 short:gap-2.5 short:pt-4 short:pb-4">
      <div className="flex flex-col items-center gap-3 text-center short:gap-2">
        <span className="flex size-28 items-center justify-center rounded-full bg-mint-light text-mint short:size-20 short:[&>svg]:size-12">
          <CheckIcon size={68} />
        </span>
        <h1 className="text-32 leading-[1.3] font-bold">연습을 마쳤어요!</h1>
        <p className="text-19 leading-normal text-text-sub">
          이제 실전모드에서
          <br />
          혼자 해볼까요?
        </p>
      </div>
      <ul
        aria-label="연습한 내용"
        className="flex flex-col gap-3 rounded-3xl bg-gray-1 px-5 py-[18px] text-17 short:gap-2 short:py-3.5"
      >
        {mission.summary.map((line) => (
          <li key={line} className="flex items-center gap-2.5">
            <span className="flex size-[26px] flex-none items-center justify-center rounded-full bg-mint text-white-pure">
              <CheckIcon size={16} />
            </span>
            {line}
          </li>
        ))}
      </ul>
      <div className="flex-1" />
      <Link href={mission.realHref} className={`${buttonClass} bg-primary text-white-pure`}>
        실전모드 도전
        <ChevronRightIcon size={20} />
      </Link>
      <Link
        href={mission.selectHref}
        className={`${buttonClass} border-2 border-primary bg-white text-primary`}
      >
        한 번 더 연습
      </Link>
    </main>
  );
}
