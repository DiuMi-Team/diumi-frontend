import { Header, HeaderChip } from "@/components/common/Header";
import { NavBar } from "@/components/common/NavBar";
import { ChoiceCard } from "@/components/home/ChoiceCard";
import { FlagIllustration, StarIllustration } from "@/components/icons/illustrations";

type RealTypeSelectProps = {
  chip: string;
  /** 칩 문구가 길면 작은 칩을 쓴다 */
  compactChip?: boolean;
  backHref: string;
  /** 없으면 아직 화면이 없다는 뜻이라 준비 중 안내를 띄운다 */
  missionHref?: string;
  freeHref?: string;
};

export function RealTypeSelect({
  chip,
  compactChip,
  backHref,
  missionHref,
  freeHref,
}: RealTypeSelectProps) {
  const illustrationClass = "absolute right-3.5 bottom-2";

  return (
    <>
      <Header right={<HeaderChip compact={compactChip}>{chip}</HeaderChip>} />
      <NavBar back={backHref} size="lg" />
      <main className="flex min-h-0 overflow-y-auto *:shrink-0 flex-1 flex-col justify-center-safe gap-[18px] p-5 short:gap-3 short:py-4">
        <h1 className="mb-1.5 text-center text-32 leading-[1.3] font-bold">
          어떤 방식으로
          <br />
          해볼까요?
        </h1>
        <ChoiceCard
          title="미션 수행하기"
          description="주어진 미션대로 해봐요"
          actionLabel="선택하기"
          tone="primary"
          size="type"
          href={missionHref}
          illustration={<FlagIllustration size={104} className={illustrationClass} />}
        />
        <ChoiceCard
          title="자유롭게 체험하기"
          description="제약 없이 마음껏 눌러봐요"
          actionLabel="선택하기"
          tone="mint"
          size="type"
          href={freeHref}
          illustration={<StarIllustration size={104} className={illustrationClass} />}
        />
      </main>
    </>
  );
}
