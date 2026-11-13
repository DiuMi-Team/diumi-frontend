import { BarcodeScanIcon } from "@/components/icons/kiosk-icons";
import { KioskButton } from "@/components/practice/PracticeContext";
import {
  KIOSK_OUTLINE_CLASS,
  KIOSK_PRIMARY_CLASS,
  ScreenHeading,
} from "@/components/practice/kiosk/parts";

/** 쿠폰 바코드 찍기 (PD04) */
export function CouponScanScreen() {
  return (
    <>
      <ScreenHeading
        title="쿠폰 바코드를 보여 주세요"
        sub="휴대폰 쿠폰의 바코드를 스캐너에 대 주세요"
      />
      <div className="flex min-h-24 flex-1 flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl bg-gray-1 text-center short:gap-1 short:[&>svg]:size-20">
        <BarcodeScanIcon size={150} />
        <span className="text-16 font-semibold text-text-sub">
          스캐너는 보통 화면 아래쪽에 있어요
        </span>
      </div>
      <div className="rounded-[18px] bg-gray-1 px-4 py-3 text-16 leading-[1.45] short:py-2">
        바코드가 잘 보이도록 휴대폰 화면을 밝게 해 주세요.
      </div>
      <KioskButton id="coupon:cancel" className={KIOSK_OUTLINE_CLASS}>
        쿠폰 사용 취소
      </KioskButton>
      <KioskButton id="coupon:scanned" className={KIOSK_PRIMARY_CLASS}>
        바코드를 찍었어요
      </KioskButton>
    </>
  );
}
