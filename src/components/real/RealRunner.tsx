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
import { endSession, logEvents, startSession, type SessionEvent } from "@/features/api/session";
import {
  EMPTY_ORDER,
  orderReducer,
  type OrderAction,
  type OrderState,
} from "@/features/order/order";
import { FINISHED_SCREENS, realProgress, type RealScreen } from "@/features/real/flow";
import { judgeMission } from "@/features/real/judge";
import type { RealSetup } from "@/features/real/missions";
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

type SessionRef = {
  id: string | null;
  started: boolean;
  startedAt: number;
  buffer: SessionEvent[];
};

const NEW_SESSION = (): SessionRef => ({ id: null, started: false, startedAt: 0, buffer: [] });

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
  const session = useRef<SessionRef>(NEW_SESSION());
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

  /** 세션을 시작하고 시간을 재기 시작한다. 한 번만 시작한다 */
  const beginSession = () => {
    const current = session.current;
    if (current.started) return;
    current.started = true;
    current.startedAt = Date.now();
    startSession({
      mode: mission ? "mission" : "free",
      service: setup.service,
      missionId: mission?.id,
    })
      .then(({ sessionId }) => {
        current.id = sessionId;
      })
      .catch(() => {});
  };

  /* 자유 체험은 미션 확인 없이 바로 시작한다 */
  useEffect(() => {
    if (!mission) beginSession();
  });

  const start = () => {
    beginSession();
    go("dine");
  };

  const back = () => {
    if (history.length > 1) setHistory((items) => items.slice(0, -1));
    else router.push(setup.typeHref);
  };

  const openVoice = () => {
    record("help_open");
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
    const elapsed = Date.now() - session.current.startedAt;
    setOrder(paid);
    setElapsedMs(elapsed);
    const sessionId = session.current.id;
    if (sessionId) {
      endSession(sessionId, {
        success: mission ? judgeMission(mission, paid).success : null,
        elapsedMs: elapsed,
        helpCount,
      }).catch(() => {});
    }
    go(mission ? "done" : "result");
  };

  /** 다시 도전하기·한 번 더 체험: 처음 상태로 되돌린다 (자유 체험은 새 세션이 바로 시작된다) */
  const restart = () => {
    session.current = NEW_SESSION();
    setOrder(NEW_ORDER);
    setHelpCount(0);
    setElapsedMs(null);
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
        <NavBar home={screen === "intro" ? "/" : () => setQuitOpen(true)} back={back} />
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
            stats: { elapsedMs: elapsedMs ?? 0, helpCount },
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
