"use client";

import { useState } from "react";
import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";
import { GuideBubble } from "@/components/common/GuideBubble";
import { Header, HeaderChip } from "@/components/common/Header";
import { NavBar } from "@/components/common/NavBar";
import { MissionProgress, PracticeProgress } from "@/components/common/Progress";
import { FreeBadge, MissionChip } from "@/components/common/StatusChip";
import { VoiceAssistantSheet } from "@/components/common/VoiceAssistantSheet";
import { VoiceButton } from "@/components/common/VoiceButton";
import { HomeFilledIcon } from "@/components/icons/ui-icons";

export function ComponentPreview() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <Header right={<HeaderChip compact>연습 · 카페</HeaderChip>} />
      <NavBar back="/" />
      <main className="flex flex-1 flex-col gap-3 px-5 pt-3.5 pb-4">
        <PracticeProgress step={2} total={4} detail="아메리카노 2잔 담기 (2/5)" />
        <GuideBubble>차갑게(ICE)를 눌러 보세요</GuideBubble>
        <GuideBubble variant="error" detail="선택은 바뀌지 않았어요">
          다른 곳을 눌렀어요. 주황 테두리의 Large를 눌러 보세요
        </GuideBubble>
        <MissionProgress step={1} label="이용 방법" />
        <MissionChip>아이스 아메리카노 2잔 · 포장 · 카드</MissionChip>
        <FreeBadge />
        <Button onClick={() => setDialogOpen(true)}>확인 창 열기</Button>
        <VoiceButton onClick={() => setSheetOpen(true)} />
      </main>
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="연습을 그만할까요?"
        description="지금까지 담은 메뉴는 사라져요."
        icon={<HomeFilledIcon size={40} />}
      >
        <Button onClick={() => setDialogOpen(false)}>계속 연습하기</Button>
        <Button variant="outline" onClick={() => setDialogOpen(false)}>
          처음으로 가기
        </Button>
      </Dialog>
      <VoiceAssistantSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        question="카드는 어디에 넣나요?"
        answer="카드는 화면 아래쪽 투입구에 넣어 주세요."
      />
    </>
  );
}
