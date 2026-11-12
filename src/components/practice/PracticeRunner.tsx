"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";
import { GuideBubble } from "@/components/common/GuideBubble";
import { Header, HeaderChip } from "@/components/common/Header";
import { NavBar } from "@/components/common/NavBar";
import { PracticeProgress } from "@/components/common/Progress";
import { HomeFilledIcon } from "@/components/icons/ui-icons";
import { CAFE_SCREENS, SCREEN_GAP } from "@/components/practice/cafe/screens";
import { MissionComplete } from "@/components/practice/MissionComplete";
import { MissionIntro } from "@/components/practice/MissionIntro";
import { PracticeProvider } from "@/components/practice/PracticeContext";
import {
  missMessage,
  nextPosition,
  orderAt,
  previousPosition,
  START_POSITION,
  stepAt,
  tap,
  type PracticePosition,
} from "@/features/practice/engine";
import type { PracticeMission } from "@/features/practice/types";

const SERVICE_LABEL = { cafe: "카페" } as const;

/** 미션 데이터 하나로 오늘의 미션 → 단계별 화면 → 연습 완료를 그린다 */
export function PracticeRunner({ mission }: { mission: PracticeMission }) {
  const router = useRouter();
  const [position, setPosition] = useState<PracticePosition>(START_POSITION);
  const [missed, setMissed] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const focusRef = useRef<HTMLDivElement>(null);
  const movedRef = useRef(false);

  /* 화면이 바뀌면 누른 버튼이 사라지므로, 새 안내 문구로 포커스를 옮겨 화면 낭독기가 읽게 한다 */
  useEffect(() => {
    if (!movedRef.current) return;
    focusRef.current?.focus();
  }, [position]);

  const move = (next: PracticePosition) => {
    movedRef.current = true;
    setPosition(next);
    setMissed(false);
    window.scrollTo(0, 0);
  };

  const goBack = () => {
    const previous = previousPosition(mission, position);
    if (previous) move(previous);
    else router.push(mission.selectHref);
  };

  const header = (
    <Header right={<HeaderChip compact>연습 · {SERVICE_LABEL[mission.service]}</HeaderChip>} />
  );

  if (position.kind === "intro") {
    return (
      <>
        {header}
        <NavBar back={mission.selectHref} />
        <MissionIntro mission={mission} onStart={() => move(nextPosition(mission, position))} />
      </>
    );
  }

  if (position.kind === "complete") {
    return (
      <>
        {header}
        <div ref={focusRef} tabIndex={-1} className="flex flex-1 flex-col outline-none">
          <MissionComplete mission={mission} />
        </div>
      </>
    );
  }

  const step = stepAt(mission, position)!;
  const Screen = CAFE_SCREENS[step.screen];

  return (
    <>
      {header}
      <NavBar home={() => setQuitOpen(true)} back={goBack} />
      <main
        className={`flex flex-1 flex-col px-5 pt-3.5 pb-4 ${SCREEN_GAP[step.screen] ?? "gap-3"}`}
      >
        <PracticeProgress
          step={step.progress.stage}
          total={mission.totalStages}
          detail={step.progress.detail}
        />
        <div ref={focusRef} tabIndex={-1} className="outline-none">
          {missed ? (
            <GuideBubble variant="error" detail="선택은 바뀌지 않았어요">
              {missMessage(step)}
            </GuideBubble>
          ) : (
            <GuideBubble detail={step.guide.detail}>{step.guide.title}</GuideBubble>
          )}
        </div>
        <PracticeProvider
          value={{
            mission,
            step,
            order: orderAt(mission, position),
            tap: (targetId) => {
              const result = tap(mission, position, targetId);
              if (result.kind === "advance") move(result.position);
              else setMissed(true);
            },
          }}
        >
          <Screen />
        </PracticeProvider>
      </main>
      <Dialog
        open={quitOpen}
        onClose={() => setQuitOpen(false)}
        title="연습을 그만할까요?"
        description="지금까지 담은 메뉴는 사라져요."
        icon={<HomeFilledIcon size={40} />}
      >
        <Button onClick={() => setQuitOpen(false)}>계속 연습하기</Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          처음으로 가기
        </Button>
      </Dialog>
    </>
  );
}
