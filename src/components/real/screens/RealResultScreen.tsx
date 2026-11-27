"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { ClockIcon } from "@/components/icons/kiosk-icons";
import { CheckIcon, MicIcon } from "@/components/icons/ui-icons";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { Spacer } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import { REAL_OUTLINE_CLASS, REAL_PRIMARY_CLASS, RealBottomBar } from "@/components/real/parts";
import { formatDuration, realOrderSummary } from "@/features/real/labels";

/**
 * 미션 결과 (RCM14). 성공이면 "미션을 성공했어요!", 아니면 "주문은 완료됐어요"와 미션과 다른 점을 보여 준다.
 * 실패 화면은 디자인에 없어 성공 화면과 같은 틀에 주황색으로 만들었다 (빨강은 연습 예외 안내에만 쓴다).
 * 맞힌 조건은 '잘한 점', 틀린 조건은 '미션과 다른 점'으로 나눠 보여 준다 (XResult2).
 * 판정은 백엔드 수행 결과만 쓴다. 받는 동안은 잠깐 기다리고, 못 받으면 "불러오지 못했어요"를 보여 준다.
 */
export function RealResultScreen() {
  const { setup, order, stats, restart, serverJudgement } = useReal();
  if (!setup.mission) throw new Error("미션 결과 화면은 미션 수행에서만 보여 줘요");
  if (serverJudgement === "pending" || serverJudgement === null) return <ResultPending />;
  if (serverJudgement === "failed") return <ResultFailed />;
  const judgement = serverJudgement;
  const { success, percent } = judgement;
  const differences = judgement.conditions.flatMap((condition) => condition.differences);
  const goodPoints = judgement.conditions.flatMap((condition) =>
    condition.goodPoint ? [condition.goodPoint] : [],
  );

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center short:gap-1.5">
        <span
          className={`flex size-24 items-center justify-center rounded-full short:size-16 short:[&>svg]:size-10 ${
            success ? "bg-mint-light text-mint" : "bg-orange-light text-orange"
          }`}
        >
          <CheckIcon size={56} />
        </span>
        <h1 className="text-32 leading-[1.3] font-bold short:text-28">
          {success ? "미션을 성공했어요!" : "주문은 완료됐어요"}
        </h1>
        {!success && <p className="text-18 text-text-sub">미션과 다른 부분이 있어요</p>}
      </div>

      <section
        aria-label="미션 수행 결과"
        className="flex flex-col gap-3 rounded-3xl bg-gray-1 p-[18px] short:gap-2 short:p-3.5"
      >
        <div className="flex items-center justify-between">
          <b className="text-19">미션 수행 결과</b>
          <b className="text-20 text-primary">{percent}%</b>
        </div>
        <div
          role="progressbar"
          aria-label="미션 수행 결과"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          className="h-3 overflow-hidden rounded-full bg-gray-2"
        >
          <div
            className={`h-full rounded-full ${success ? "bg-mint" : "bg-orange"}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <Stat
            label="소요 시간"
            value={formatDuration(stats.elapsedMs)}
            icon={<ClockIcon size={36} />}
          />
          <Stat
            label="도움 요청"
            value={`${stats.helpCount}회`}
            icon={
              <span className="flex size-9 items-center justify-center rounded-full bg-orange">
                <MicIcon size={20} />
              </span>
            }
          />
        </div>
      </section>

      {goodPoints.length > 0 && (
        <section
          aria-label="잘한 점"
          className="flex flex-col gap-2 rounded-3xl border-2 border-mint bg-white-pure px-5 py-4 short:py-3"
        >
          <b className="text-18">잘한 점</b>
          <ul className="flex flex-col gap-2 text-17 leading-[1.45] short:gap-1.5">
            {goodPoints.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mt-px flex size-[22px] flex-none items-center justify-center rounded-full bg-mint text-white-pure"
                >
                  <CheckIcon size={13} strokeWidth={3.8} />
                </span>
                {point}
              </li>
            ))}
          </ul>
        </section>
      )}

      {differences.length > 0 && (
        <section
          aria-label="미션과 다른 점"
          className="flex flex-col gap-2 rounded-3xl border-2 border-orange bg-white-pure px-5 py-4 short:py-3"
        >
          <b className="text-18">미션과 다른 점</b>
          <ul className="flex flex-col gap-1.5 text-17 leading-[1.45]">
            {differences.map((difference) => (
              <li key={difference} className="flex items-start gap-2">
                <span
                  aria-hidden="true"
                  className="mx-2 mt-[10px] size-1.5 flex-none rounded-full bg-orange"
                />
                {difference}
              </li>
            ))}
          </ul>
        </section>
      )}

      <Spacer />
      <RealBottomBar>
        <button type="button" onClick={restart} className={REAL_PRIMARY_CLASS}>
          다시 도전하기
        </button>
        <Link href="/" className={REAL_OUTLINE_CLASS}>
          처음으로
        </Link>
      </RealBottomBar>
    </>
  );
}

/** 서버 수행 결과를 받는 동안 (보통 1초 안팎). 디자인에 없어 결과 화면 머리 모양을 빌렸다 */
function ResultPending() {
  return (
    <div
      role="status"
      className="flex flex-1 flex-col items-center justify-center gap-3 text-center"
    >
      <span className="flex size-24 items-center justify-center rounded-full bg-gray-1 text-primary short:size-16 short:[&>svg]:size-10">
        <ClockIcon size={56} />
      </span>
      <p className="text-24 leading-[1.3] font-bold">결과를 확인하고 있어요</p>
      <p className="text-18 text-text-sub">잠시만 기다려 주세요</p>
    </div>
  );
}

/**
 * 서버 수행 결과를 받지 못했을 때. 주문(결제)은 끝났으니 그 사실을 먼저 알리고, 다시 불러오게 한다.
 * 디자인에 없어 결과 화면 머리 모양과 주황색(실패 화면 색)을 빌렸다.
 */
function ResultFailed() {
  const { setup, order, restart, retryResult } = useReal();
  return (
    <>
      <div role="alert" className="flex flex-col items-center gap-3 text-center short:gap-1.5">
        <span className="flex size-24 items-center justify-center rounded-full bg-orange-light text-orange short:size-16 short:[&>svg]:size-10">
          <ClockIcon size={56} />
        </span>
        <h1 className="text-28 leading-[1.3] font-bold short:text-24">결과를 불러오지 못했어요</h1>
        <p className="text-18 leading-normal text-text-sub">
          주문은 완료됐어요.
          <br />
          잠시 후 다시 불러와 주세요.
        </p>
      </div>

      <section
        aria-label="완료한 주문"
        className="flex flex-col gap-1.5 rounded-3xl border-2 border-gray-1 px-5 py-4 short:py-3"
      >
        <b className="text-18">완료한 주문</b>
        <p className="text-17 leading-[1.45]">{realOrderSummary(order)}</p>
        <b className="text-17 text-primary">
          {KIOSK_COPY[setup.service].numberLabel} {setup.orderNumber}
        </b>
      </section>

      <Spacer />
      <RealBottomBar>
        <button type="button" onClick={retryResult} className={REAL_PRIMARY_CLASS}>
          결과 다시 불러오기
        </button>
        <button type="button" onClick={restart} className={REAL_OUTLINE_CLASS}>
          다시 도전하기
        </button>
        <Link href="/" className={REAL_OUTLINE_CLASS}>
          처음으로
        </Link>
      </RealBottomBar>
    </>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-[20px] bg-white px-4 py-3 short:py-2">
      {icon}
      <span className="flex flex-col">
        <span className="text-16 text-text-sub">{label}</span>
        <b className="text-20">{value}</b>
      </span>
    </div>
  );
}
