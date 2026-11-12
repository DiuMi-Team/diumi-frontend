import Link from "next/link";
import { ComingSoonButton } from "@/components/common/ComingSoonButton";
import { Header, HeaderLink } from "@/components/common/Header";
import {
  BurgerIllustration,
  CupIllustration,
  PinIllustration,
  TrainIllustration,
} from "@/components/icons/illustrations";
import { ChevronRightIcon } from "@/components/icons/ui-icons";

const serviceCardClass =
  "flex h-[200px] w-full flex-col items-center justify-center gap-3.5 rounded-[28px] bg-gray-1 text-24 font-bold short:h-[156px] short:gap-2 short:[&>svg]:size-[72px]";

export default function Home() {
  return (
    <>
      <Header
        right={
          <HeaderLink href="/help" label="도움말 보기">
            도움말
            <ChevronRightIcon size={18} />
          </HeaderLink>
        }
      />
      <main className="flex min-h-0 overflow-y-auto *:shrink-0 flex-1 flex-col gap-5 px-5 pt-6 pb-5 short:gap-3 short:pt-4 short:pb-4">
        <div>
          <h1 className="text-30 leading-[1.3] font-bold">무엇을 배워볼까요?</h1>
          <p className="mt-1.5 text-18 text-text-sub">서비스를 골라 주세요</p>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <Link href="/cafe" aria-label="카페" className={serviceCardClass}>
            <CupIllustration size={92} />
            카페
          </Link>
          <Link href="/fastfood" aria-label="패스트푸드" className={serviceCardClass}>
            <BurgerIllustration size={92} />
            패스트푸드
          </Link>
          <ComingSoonButton label="열차" className={serviceCardClass}>
            <TrainIllustration size={92} />
            열차
          </ComingSoonButton>
          <ComingSoonButton label="길찾기" className={serviceCardClass}>
            <PinIllustration size={92} />
            길찾기
          </ComingSoonButton>
        </div>
        <Link
          href="/help"
          aria-label="처음이신가요? 이용 방법 보러 가기"
          className="flex h-[104px] items-center justify-between gap-3 rounded-[28px] bg-orange px-5 short:h-[88px]"
        >
          <span className="flex flex-col gap-0.5">
            <span className="text-21 font-bold">처음이신가요?</span>
            <span className="text-16">이용 방법을 알려 드려요</span>
          </span>
          <span className="flex h-[46px] flex-none items-center gap-1.5 rounded-full bg-text px-[18px] text-17 font-bold text-white-pure">
            보러 가기
            <ChevronRightIcon size={18} />
          </span>
        </Link>
      </main>
    </>
  );
}
