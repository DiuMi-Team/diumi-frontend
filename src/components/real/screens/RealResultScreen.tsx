"use client";

import type { ReactNode } from "react";

import Link from "next/link";
import { ClockIcon } from "@/components/icons/kiosk-icons";
import { CheckIcon, MicIcon } from "@/components/icons/ui-icons";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { Spacer } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import { REAL_OUTLINE_CLASS, REAL_PRIMARY_CLASS, RealBottomBar } from "@/components/real/parts";
import { judgeMission } from "@/features/real/judge";
import { formatDuration, realOrderSummary } from "@/features/real/labels";

/**
 * 미션 결과 (RCM14). 성공이면 "미션을 성공했어요!", 아니면 "주문은 완료됐어요"와 미션과 다른 점을 보여 준다.
 * 실패 화면은 디자인에 없어 성공 화면과 같은 틀에 주황색으로 만들었다 (빨강은 연습 예외 안내에만 쓴다).
 */
export function RealResultScreen() {
  const { setup, order, stats, restart } = useReal();
  const mission = setup.mission;
  if (!mission) throw new Error("미션 결과 화면은 미션 수행에서만 보여 줘요");
  const judgement = judgeMission(mission, order);
  const { success, percent } = judgement;
  const differences = judgement.conditions.flatMap((condition) => condition.differences);

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

      {!success && (
        <section
          aria-label="미션과 다른 점"
          className="flex flex-col gap-2 rounded-3xl border-2 border-orange bg-white px-5 py-4 short:py-3"
        >
          <b className="text-18">미션과 다른 점</b>
          <ul className="flex flex-col gap-1.5 text-17 leading-[1.45]">
            {differences.map((difference) => (
              <li key={difference} className="flex gap-2">
                <span aria-hidden="true" className="text-orange">
                  •
                </span>
                {difference}
              </li>
            ))}
          </ul>
        </section>
      )}

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
