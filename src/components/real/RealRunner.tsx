"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";
import { Header, HeaderChip } from "@/components/common/Header";
import { NavBar } from "@/components/common/NavBar";
import { MissionProgress } from "@/components/common/Progress";
import { MissionChip } from "@/components/common/StatusChip";
import { VoiceAssistantSheet } from "@/components/common/VoiceAssistantSheet";
import { VoiceButton } from "@/components/common/VoiceButton";
import { HomeFilledIcon } from "@/components/icons/ui-icons";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { RealProvider } from "@/components/real/RealContext";
import { RealMissionIntro } from "@/components/real/RealMissionIntro";
import { RealCartScreen } from "@/components/real/screens/RealCartScreen";
import { RealDineScreen } from "@/components/real/screens/RealDineScreen";
import { RealFreeOptionsScreen } from "@/components/real/screens/RealFreeOptionsScreen";
import { RealMembershipScreen } from "@/components/real/screens/RealMembershipScreen";
import { RealMenuScreen } from "@/components/real/screens/RealMenuScreen";
import { RealOptionsScreen } from "@/components/real/screens/RealOptionsScreen";
import { RealPaidOptionsScreen } from "@/components/real/screens/RealPaidOptionsScreen";
import { logEvents, startSession, type SessionEvent } from "@/features/api/session";
import {
  EMPTY_ORDER,
  orderReducer,
  type OrderAction,
  type OrderState,
} from "@/features/order/order";
import { realProgress, type RealScreen } from "@/features/real/flow";
import type { RealMission } from "@/features/real/missions";
import { VOICE_SAMPLES } from "@/features/real/voice";

const SCREENS: Record<Exclude<RealScreen, "intro">, ComponentType> = {
  dine: RealDineScreen,
  menu: RealMenuScreen,
  options: RealOptionsScreen,
  paidOptions: RealPaidOptionsScreen,
  freeOptions: RealFreeOptionsScreen,
  cart: RealCartScreen,
  membership: RealMembershipScreen,
};

/** 화면마다 본문 간격. 칸이 많은 화면은 10px, 나머지는 12px */
const SCREEN_GAP: Partial<Record<RealScreen, string>> = {
  menu: "gap-2.5 short:gap-1.5",
  options: "gap-2.5 short:gap-1.5",
  paidOptions: "gap-2.5 short:gap-1.5",
  freeOptions: "gap-2.5 short:gap-1.5",
};

type SessionRef = { id: string | null; startedAt: number; buffer: SessionEvent[] };

/** 실전모드 미션 수행. 강조·정답 없이 스스로 주문한다 (RCM00~) */
export function RealRunner({ mission }: { mission: RealMission }) {
  const router = useRouter();
  const [history, setHistory] = useState<RealScreen[]>(["intro"]);
  const [order, setOrder] = useState<OrderState>({ ...EMPTY_ORDER, sizeMenu: "real" });
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const session = useRef<SessionRef>({ id: null, startedAt: 0, buffer: [] });
  const mainRef = useRef<HTMLElement>(null);
  const screen = history[history.length - 1];

  const record = (type: string, target?: string) => {
    const current = session.current;
    if (!current.id) return;
    current.buffer.push({ type, screen, target, elapsedMs: Date.now() - current.startedAt });
  };

  /* 화면이 바뀌면 본문을 맨 위로 올리고, 모아 둔 행동 기록을 보낸다 (실패해도 진행은 계속한다) */
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    const current = session.current;
    if (!current.id) return;
    current.buffer.push({
      type: "screen_view",
      screen,
      elapsedMs: Date.now() - current.startedAt,
    });
    const events = current.buffer.splice(0);
    logEvents(current.id, events).catch(() => {});
  }, [screen, history.length]);

  const go = (next: RealScreen) => setHistory((items) => [...items, next]);

  const start = () => {
    session.current.startedAt = Date.now();
    startSession({ mode: "mission", service: mission.service, missionId: mission.id })
      .then(({ sessionId }) => {
        session.current.id = sessionId;
      })
      .catch(() => {});
    go("dine");
  };

  const back = () => {
    if (history.length > 1) setHistory((items) => items.slice(0, -1));
    else router.push(mission.typeHref);
  };

  const openVoice = () => {
    record("help_open");
    setVoiceOpen(true);
  };

  const act = (action: OrderAction, target: string) => {
    record("tap", target);
    setOrder((current) => orderReducer(current, action));
  };

  const progress = screen === "intro" ? null : realProgress(screen, order);
  const Screen = screen === "intro" ? null : SCREENS[screen];
  const serviceName = KIOSK_COPY[mission.service].serviceName;

  return (
    <>
      <Header
        right={
          <HeaderChip compact={mission.service === "fastfood"}>실전 · {serviceName}</HeaderChip>
        }
      />
      <NavBar home={screen === "intro" ? "/" : () => setQuitOpen(true)} back={back} />
      <main
        ref={mainRef}
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto px-5 *:shrink-0 short:pt-2 ${
          screen === "intro" ? "gap-3 pt-[18px] pb-3 short:gap-2" : "pt-3.5 pb-3"
        } ${SCREEN_GAP[screen] ?? "gap-3 short:gap-2"}`}
      >
        {progress && <MissionProgress step={progress.step} label={progress.label} />}
        {screen === "dine" && <MissionChip>{mission.chip}</MissionChip>}
        <RealProvider
          value={{ mission, order, act, go, back, comingSoon: () => setComingSoonOpen(true) }}
        >
          {Screen ? <Screen /> : <RealMissionIntro mission={mission} onStart={start} />}
        </RealProvider>
      </main>
      <div className="flex-none px-5 pb-4 short:pb-2.5">
        <VoiceButton onClick={openVoice} />
      </div>

      <VoiceAssistantSheet
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        question={VOICE_SAMPLES[screen].question}
        answer={VOICE_SAMPLES[screen].answer}
      />
      <Dialog
        open={quitOpen}
        onClose={() => setQuitOpen(false)}
        title="미션을 그만할까요?"
        description="지금까지 담은 메뉴는 사라져요."
        icon={<HomeFilledIcon size={40} />}
      >
        <Button onClick={() => setQuitOpen(false)}>계속하기</Button>
        <Button variant="outline" onClick={() => router.push("/")}>
          처음으로 가기
        </Button>
      </Dialog>
      <Dialog
        open={comingSoonOpen}
        onClose={() => setComingSoonOpen(false)}
        title="준비 중이에요"
        description="조금만 기다려 주세요."
      >
        <Button onClick={() => setComingSoonOpen(false)}>확인</Button>
      </Dialog>
    </>
  );
}
