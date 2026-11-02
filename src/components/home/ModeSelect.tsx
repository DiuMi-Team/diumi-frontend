import { Header, HeaderChip } from "@/components/common/Header";
import { ChoiceCard } from "@/components/home/ChoiceCard";
import { BookIllustration, KioskIllustration } from "@/components/icons/illustrations";

type ModeSelectProps = {
  serviceName: string;
  realHref: string;
};

export function ModeSelect({ serviceName, realHref }: ModeSelectProps) {
  const illustrationClass = "absolute right-3.5 bottom-2.5";

  return (
    <>
      <Header right={<HeaderChip>{serviceName}</HeaderChip>} />
      <main className="flex flex-1 flex-col justify-center gap-5 px-5 py-6">
        <h1 className="mb-2 text-center text-32 leading-[1.3] font-bold">어떻게 해볼까요?</h1>
        <ChoiceCard
          title="실전모드"
          description="실제처럼 직접 주문해 봐요"
          actionLabel="시작하기"
          tone="primary"
          size="mode"
          href={realHref}
          illustration={<KioskIllustration size={116} className={illustrationClass} />}
        />
        <ChoiceCard
          title="연습모드"
          description="따라 하며 천천히 배워요"
          actionLabel="시작하기"
          tone="mint"
          size="mode"
          illustration={<BookIllustration size={116} className={illustrationClass} />}
        />
      </main>
    </>
  );
}
