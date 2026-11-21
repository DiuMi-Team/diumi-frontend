"use client";

import { CouponIcon, MembershipStarIcon } from "@/components/icons/kiosk-icons";
import { ChevronRightIcon } from "@/components/icons/ui-icons";
import { ScreenHeading, Spacer } from "@/components/practice/kiosk/parts";
import { useReal } from "@/components/real/RealContext";
import { REAL_PRIMARY_CLASS, RealBottomBar } from "@/components/real/parts";

const TILE_CLASS =
  "flex h-40 flex-col items-center justify-center gap-2.5 rounded-3xl bg-gray-1 text-19 font-bold short:h-[120px] short:gap-1.5 short:[&>svg]:size-12";

/** 멤버십·쿠폰 (RCM08). 적립·쿠폰은 아직 준비 중이고, 다음으로 결제 방식 선택으로 간다 */
export function RealMembershipScreen() {
  const { comingSoon, go } = useReal();

  return (
    <>
      <ScreenHeading title="멤버십이나 쿠폰이 있나요?" sub="없으면 건너뛸 수 있어요" />
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={comingSoon} className={TILE_CLASS}>
          <MembershipStarIcon size={64} />
          멤버십 적립
        </button>
        <button type="button" onClick={comingSoon} className={TILE_CLASS}>
          <CouponIcon size={64} tone="blue" shadow />
          쿠폰 사용
        </button>
      </div>
      <button
        type="button"
        onClick={() => go("paymentMethod")}
        className="flex h-[72px] items-center justify-between rounded-3xl bg-gray-1 px-5 text-19 font-bold short:h-14"
      >
        적립·쿠폰 없이 진행
        <span className="flex size-9 items-center justify-center rounded-full bg-white">
          <ChevronRightIcon size={18} />
        </span>
      </button>
      <p className="text-16 leading-normal text-text-sub opacity-80">
        휴대전화 번호 입력 또는 바코드 인식으로 적립할 수 있어요.
      </p>
      <Spacer />
      <RealBottomBar>
        <button type="button" onClick={() => go("paymentMethod")} className={REAL_PRIMARY_CLASS}>
          다음
          <ChevronRightIcon size={20} />
        </button>
      </RealBottomBar>
    </>
  );
}
