import Link from "next/link";
import type { ReactNode } from "react";
import { ComingSoonButton } from "@/components/common/ComingSoonButton";
import { Header, HeaderChip } from "@/components/common/Header";
import { ChevronRightIcon } from "@/components/icons/ui-icons";

export type MissionChoice = {
  title: string;
  description: string;
  icon: ReactNode;
  /** 없으면 아직 만들지 않은 미션이라 준비 중 안내를 띄운다 */
  href?: string;
};

type MissionSelectProps = {
  serviceName: string;
  missions: MissionChoice[];
};

/** 연습 미션 선택 (PA00, PB00) */
export function MissionSelect({ serviceName, missions }: MissionSelectProps) {
  return (
    <>
      <Header right={<HeaderChip compact>연습 · {serviceName}</HeaderChip>} />
      <main className="flex flex-1 flex-col gap-3.5 px-5 pt-6 pb-5">
        <div>
          <h1 className="text-28 leading-[1.3] font-bold">어떤 연습을 해볼까요?</h1>
          <p className="mt-1 text-17 text-text-sub">{serviceName} 키오스크 연습 미션이에요</p>
        </div>
        {missions.map((mission) => (
          <MissionCard key={mission.title} mission={mission} />
        ))}
      </main>
    </>
  );
}

function MissionCard({ mission }: { mission: MissionChoice }) {
  const className =
    "flex w-full items-center gap-3.5 rounded-3xl bg-gray-1 px-[18px] py-4 text-left";
  const label = `${mission.title}, ${mission.description}`;

  const content = (
    <>
      {mission.icon}
      <span className="flex flex-1 flex-col">
        <b className="text-18 leading-[1.35]">{mission.title}</b>
        <span className="text-16 text-text-sub">{mission.description}</span>
      </span>
      <ChevronRightIcon size={22} />
    </>
  );

  if (mission.href) {
    return (
      <Link href={mission.href} aria-label={label} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <ComingSoonButton label={label} className={className}>
      {content}
    </ComingSoonButton>
  );
}
