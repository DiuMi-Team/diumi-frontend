"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { Button } from "@/components/common/Button";
import { Dialog } from "@/components/common/Dialog";
import { Header, HeaderChip } from "@/components/common/Header";
import { NavBar } from "@/components/common/NavBar";
import { MissionProgress } from "@/components/common/Progress";
import { FreeBadge, MissionChip } from "@/components/common/StatusChip";
import { VoiceAssistantSheet } from "@/components/common/VoiceAssistantSheet";
import { VoiceButton } from "@/components/common/VoiceButton";
import { HomeFilledIcon } from "@/components/icons/ui-icons";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { RealProvider } from "@/components/real/RealContext";
import { RealMissionIntro } from "@/components/real/RealMissionIntro";
import { RealCartScreen } from "@/components/real/screens/RealCartScreen";
import { RealDineScreen } from "@/components/real/screens/RealDineScreen";
import {
  RealBurgerConfirmScreen,
  RealOrderReviewScreen,
  RealSetChoiceScreen,
  RealSetComposeScreen,
} from "@/components/real/screens/RealFastfoodScreens";
import { RealFreeOptionsScreen } from "@/components/real/screens/RealFreeOptionsScreen";
import { RealMembershipScreen } from "@/components/real/screens/RealMembershipScreen";
import { RealMenuScreen } from "@/components/real/screens/RealMenuScreen";
import { RealOptionsScreen } from "@/components/real/screens/RealOptionsScreen";
import { RealPaidOptionsScreen } from "@/components/real/screens/RealPaidOptionsScreen";
import {
  RealPayCardScreen,
  RealPayGiftCardScreen,
  RealPayMobileScreen,
} from "@/components/real/screens/RealPayScreens";
import { RealDoneScreen } from "@/components/real/screens/RealDoneScreen";
import { RealPaymentMethodScreen } from "@/components/real/screens/RealPaymentMethodScreen";
import { RealFreeResultScreen } from "@/components/real/screens/RealFreeResultScreen";
import { RealResultScreen } from "@/components/real/screens/RealResultScreen";
import { logEvents, type SessionEvent } from "@/features/api/session";
import {
  EMPTY_ORDER,
  orderReducer,
  type OrderAction,
  type OrderState,
} from "@/features/order/order";
import { FINISHED_SCREENS, realProgress, type RealScreen } from "@/features/real/flow";
import type { RealSetup } from "@/features/real/missions";
import { RealSessionTracker } from "@/features/real/session-tracker";
import { voiceSample } from "@/features/real/voice";

const SCREENS: Record<Exclude<RealScreen, "intro">, ComponentType> = {
  dine: RealDineScreen,
  menu: RealMenuScreen,
  options: RealOptionsScreen,
  paidOptions: RealPaidOptionsScreen,
  freeOptions: RealFreeOptionsScreen,
  cart: RealCartScreen,
  membership: RealMembershipScreen,
  setChoice: RealSetChoiceScreen,
  setCompose: RealSetComposeScreen,
  burgerConfirm: RealBurgerConfirmScreen,
  orderReview: RealOrderReviewScreen,
  paymentMethod: RealPaymentMethodScreen,
  payMobile: RealPayMobileScreen,
  payGiftCard: RealPayGiftCardScreen,
  payCard: RealPayCardScreen,
  done: RealDoneScreen,
  result: RealResultScreen,
};

/** 화면마다 본문 간격. 칸이 많은 화면은 10px, 나머지는 12px */
const SCREEN_GAP: Partial<Record<RealScreen, string>> = {
  menu: "gap-2.5 short:gap-1.5",
  options: "gap-2.5 short:gap-1.5",
  paidOptions: "gap-2.5 short:gap-1.5",
  freeOptions: "gap-2.5 short:gap-1.5",
  setCompose: "gap-2.5 short:gap-1.5",
  done: "gap-3.5 short:gap-2.5",
  result: "gap-3.5 short:gap-2.5",
};

const NEW_ORDER: OrderState = { ...EMPTY_ORDER, sizeMenu: "real" };

/** 백엔드 결과에서 받은 소요 시간·도움 횟수. 받기 전이나 실패하면 프론트 값을 쓴다 */
type ServerStats = { elapsedMs: number; helpCount: number };

/**
 * 실전모드. 강조·정답 없이 스스로 주문한다.
 * - 미션 수행 (RCM00~14): 미션 확인 → 주문 → 결제 → 결제 완료 → 판정 결과
 * - 자유 체험 (RCF01~13): 바로 주문 → 결제 → 체험 완료 (판정 없음)
 * 패스트푸드 (RBM00~13, RBF01~12)도 같은 흐름이고, 메뉴 이후 화면만 다르다
 */
export function RealRunner({ setup }: { setup: RealSetup }) {
  const router = useRouter();
  const mission = setup.mission;
  const firstScreen: RealScreen = mission ? "intro" : "dine";
  const [history, setHistory] = useState<RealScreen[]>([firstScreen]);
  const [order, setOrder] = useState<OrderState>(NEW_ORDER);
  /** 음성 도우미를 연 횟수 */
  const [helpCount, setHelpCount] = useState(0);
  /** 미션 시작부터 결제를 마칠 때까지 걸린 시간. 결제 전에는 null */
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [serverStats, setServerStats] = useState<ServerStats | null>(null);
  const newTracker = () => new RealSessionTracker(setup.service, mission?.apiMissionId);
  const [initialTracker] = useState(newTracker);
  const tracker = useRef(initialTracker);
  /** 메뉴·옵션 같은 나머지 행동 기록 (mock). 화면이 바뀔 때 모아서 보낸다 */
  const eventBuffer = useRef<SessionEvent[]>([]);
  const mainRef = useRef<HTMLElement>(null);
  const screen = history[history.length - 1];

  const abandonTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  /*
   * 중간에 떠나면 세션을 ABANDONED로 끝낸다.
   * - 화면을 벗어날 때(처음으로 가기, 뒤로 나가기, 헤더 로고): 컴포넌트가 사라질 때
   * - 탭을 닫거나 새로고침할 때: pagehide (keepalive로 끝까지 보낸다)
   * 개발 모드 StrictMode는 바로 다시 마운트하므로, 타이머로 미뤘다가 다시 마운트되면 취소한다.
   */
  useEffect(() => {
    clearTimeout(abandonTimer.current);
    const onPageHide = () => tracker.current.abandon(true);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      const leaving = tracker.current;
      abandonTimer.current = setTimeout(() => leaving.abandon(true), 0);
    };
  }, []);

  const record = (type: string, target?: string) => {
    if (!tracker.current.sessionId) return;
    eventBuffer.current.push({
      type,
      screen,
      target,
      elapsedMs: Date.now() - tracker.current.startedAt,
    });
  };

  /*
   * 화면이 바뀌면 본문을 맨 위로 올린다.
   * 진행 단계가 바뀌었으면 지나온 백엔드 단계를 완료하고, 모아 둔 행동 기록(mock)을 보낸다.
   */
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    const current = tracker.current;
    if (screen !== "intro" && screen !== "result") {
      current.enterProgress(realProgress(screen, order, setup.service).step);
    }
    const sessionId = current.sessionId;
    if (!sessionId || current.isEnded) return;
    eventBuffer.current.push({
      type: "screen_view",
      screen,
      elapsedMs: Date.now() - current.startedAt,
    });
    logEvents(sessionId, eventBuffer.current.splice(0)).catch(() => {});
    // order는 화면이 바뀐 그 순간의 값만 쓴다 (장바구니가 차 있는지로 메뉴 화면의 단계를 가른다)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, history.length]);

  const go = (next: RealScreen) => setHistory((items) => [...items, next]);

  /* 자유 체험은 미션 확인 없이 바로 시작한다 (한 번만 시작된다) */
  useEffect(() => {
    if (!mission) tracker.current.start();
  });

  const start = () => {
    tracker.current.start();
    go("dine");
  };

  /** 화면 안에서 앞 화면으로 돌아간다 (유료·무료 옵션을 다 고르고 옵션 화면으로 돌아갈 때) */
  const back = () => {
    if (history.length > 1) setHistory((items) => items.slice(0, -1));
    else router.push(setup.typeHref);
  };

  /** 사용자가 "이전으로"를 눌렀다. 실전 유형 선택으로 나가는 게 아니면 뒤로 가기로 기록한다 */
  const userBack = () => {
    if (history.length > 1) tracker.current.recordAction("BACK");
    back();
  };

  const openVoice = () => {
    record("help_open");
    tracker.current.recordAction("AI_HELP");
    setHelpCount((count) => count + 1);
    setVoiceOpen(true);
  };

  /**
   * 결제를 마친다. 걸린 시간을 재고 세션을 끝낸다.
   * 미션 수행은 결제 완료 화면을 거쳐 판정 결과로, 자유 체험은 바로 체험 완료 화면으로 간다.
   */
  const finishPayment = (target: string) => {
    record("tap", target);
    const paid = orderReducer(order, { type: "completePayment" });
    const current = tracker.current;
    setOrder(paid);
    setElapsedMs(Date.now() - current.startedAt);
    /* 소요 시간·도움 횟수는 백엔드 결과로 바꿔 보여 준다. 성공·실패와 다른 점은 아직 프론트 판정(judge.ts) */
    current
      .complete()
      .then((result) => {
        if (!result || tracker.current !== current) return;
        setServerStats({ elapsedMs: result.elapsedSeconds * 1000, helpCount: result.aiHelpCount });
      })
      .catch(() => {});
    go(mission ? "done" : "result");
  };

  /** 다시 도전하기·한 번 더 체험: 처음 상태로 되돌린다 (자유 체험은 새 세션이 바로 시작된다) */
  const restart = () => {
    tracker.current.abandon();
    tracker.current = newTracker();
    eventBuffer.current = [];
    setOrder(NEW_ORDER);
    setHelpCount(0);
    setElapsedMs(null);
    setServerStats(null);
    setHistory([firstScreen]);
  };

  const act = (action: OrderAction, target: string) => {
    record("tap", target);
    setOrder((current) => orderReducer(current, action));
  };

  const finished = FINISHED_SCREENS.includes(screen);
  const progress =
    !mission || screen === "intro" || screen === "result"
      ? null
      : realProgress(screen, order, setup.service);
  const Screen =
    screen === "intro"
      ? null
      : screen === "result" && !mission
        ? RealFreeResultScreen
        : SCREENS[screen];
  const serviceName = KIOSK_COPY[setup.service].serviceName;

  return (
    <>
      <Header
        right={<HeaderChip compact={setup.service === "fastfood"}>실전 · {serviceName}</HeaderChip>}
      />
      {!finished && (
        <NavBar home={screen === "intro" ? "/" : () => setQuitOpen(true)} back={userBack} />
      )}
      <main
        ref={mainRef}
        className={`flex min-h-0 flex-1 flex-col overflow-y-auto px-5 *:shrink-0 short:pt-2 ${
          screen === "intro"
            ? "gap-3 pt-[18px] pb-3 short:gap-2"
            : screen === "result"
              ? "pt-6 pb-5 short:pt-4 short:pb-4"
              : finished
                ? "pt-3.5 pb-5 short:pb-4"
                : "pt-3.5 pb-3"
        } ${SCREEN_GAP[screen] ?? "gap-3 short:gap-2"}`}
      >
        {progress && <MissionProgress step={progress.step} label={progress.label} />}
        {/* 미션은 진행바가 있는 모든 화면(1/9~9/9)에서 계속 보여준다 */}
        {mission
          ? progress && <MissionChip>{mission.chip}</MissionChip>
          : screen === "dine" && <FreeBadge />}
        <RealProvider
          value={{
            setup,
            order,
            act,
            go,
            back,
            finishPayment,
            restart,
            stats: serverStats ?? { elapsedMs: elapsedMs ?? 0, helpCount },
            comingSoon: () => setComingSoonOpen(true),
          }}
        >
          {Screen ? <Screen /> : mission && <RealMissionIntro mission={mission} onStart={start} />}
        </RealProvider>
      </main>
      {!finished && (
        <div className="flex-none px-5 pb-4 short:pb-2.5">
          <VoiceButton onClick={openVoice} />
        </div>
      )}

      <VoiceAssistantSheet
        open={voiceOpen}
        onClose={() => setVoiceOpen(false)}
        question={voiceSample(setup.service, screen).question}
        answer={voiceSample(setup.service, screen).answer}
      />
      <Dialog
        open={quitOpen}
        onClose={() => setQuitOpen(false)}
        title={mission ? "미션을 그만할까요?" : "체험을 그만할까요?"}
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
