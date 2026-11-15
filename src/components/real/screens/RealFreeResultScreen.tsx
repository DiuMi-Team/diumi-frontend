"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ClockIcon } from "@/components/icons/kiosk-icons";
import { CheckIcon, MicIcon } from "@/components/icons/ui-icons";
import { KIOSK_COPY } from "@/components/practice/kiosk/copy";
import { Spacer } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import { REAL_OUTLINE_CLASS, REAL_PRIMARY_CLASS } from "@/components/real/parts";
import { formatDuration } from "@/features/real/labels";

/** 자유 체험 완료 (RCF13). 성공·실패 없이 번호와 소요 시간·도움 요청만 보여 준다 */
export function RealFreeResultScreen() {
  const { setup, stats, restart } = useReal();

  return (
    <>
      <div className="flex flex-col items-center gap-2.5 text-center short:gap-1.5">
        <span className="flex size-24 items-center justify-center rounded-full bg-mint-light text-mint short:size-16 short:[&>svg]:size-10">
          <CheckIcon size={58} />
        </span>
        <h1 className="text-30 font-bold short:text-28">주문 체험을 마쳤어요!</h1>
      </div>
      <div className="flex flex-col items-center rounded-[28px] bg-gray-1 p-[18px] short:py-3">
        <span className="text-17 font-bold text-text-sub">
          {KIOSK_COPY[setup.service].numberLabel}
        </span>
        <b className="text-72 leading-[1.1] short:text-56">{setup.orderNumber}</b>
      </div>
      <section aria-label="체험 기록" className="grid grid-cols-2 gap-2.5">
        <Stat
          label="소요 시간"
          value={formatDuration(stats.elapsedMs)}
          icon={<ClockIcon size={36} />}
        />
        <Stat
          label="도움 요청"
          value={`${stats.helpCount}회`}
          icon={
            <span className="flex size-9 flex-none items-center justify-center rounded-full bg-orange">
              <MicIcon size={20} />
            </span>
          }
        />
      </section>
      <p className="rounded-[20px] border-2 border-gray-1 px-4 py-3.5 text-16 leading-normal short:py-2.5">
        자유 체험은 성공·실패 없이 주문 과정과 도움 요청 기록만 저장해요.
      </p>
      <Spacer />
      <button type="button" onClick={restart} className={REAL_PRIMARY_CLASS}>
        한 번 더 체험
      </button>
      <Link href="/" className={REAL_OUTLINE_CLASS}>
        처음으로
      </Link>
    </>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[20px] bg-gray-1 p-3.5 short:py-2.5">
      {icon}
      <span className="flex flex-col">
        <span className="text-16 text-text-sub">{label}</span>
        <b className="text-20">{value}</b>
      </span>
    </div>
  );
}
