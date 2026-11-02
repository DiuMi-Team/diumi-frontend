import Link from "next/link";
import type { ReactNode } from "react";
import { ComingSoonButton } from "@/components/common/ComingSoonButton";
import { ChevronRightIcon } from "@/components/icons/ui-icons";

type ChoiceCardProps = {
  title: string;
  description: string;
  actionLabel: string;
  illustration: ReactNode;
  tone: "primary" | "mint";
  /** mode는 모드 선택, type은 실전 유형 선택 화면의 크기 */
  size: "mode" | "type";
  /** 없으면 아직 화면이 없다는 뜻이라 준비 중 안내를 띄운다 */
  href?: string;
};

const sizeClass = {
  mode: { card: "h-[200px] px-6 pt-[26px] pb-[22px]", title: "text-32" },
  type: { card: "h-[190px] px-6 pt-6 pb-5", title: "text-29" },
};

export function ChoiceCard({
  title,
  description,
  actionLabel,
  illustration,
  tone,
  size,
  href,
}: ChoiceCardProps) {
  const className = `relative flex w-full flex-col overflow-hidden rounded-[32px] text-left text-white-pure ${
    tone === "primary" ? "bg-primary" : "bg-mint"
  } ${sizeClass[size].card}`;
  const label = `${title} ${actionLabel}`;

  const content = (
    <>
      <span className={`leading-[1.2] font-bold ${sizeClass[size].title}`}>{title}</span>
      <span className="mt-1.5 text-18">{description}</span>
      <span className="flex-1" />
      <span className="flex h-12 items-center gap-2 self-start rounded-[14px] bg-white-pure/25 px-[18px] text-18 font-bold">
        {actionLabel}
        <ChevronRightIcon size={18} />
      </span>
      {illustration}
    </>
  );

  if (href) {
    return (
      <Link href={href} aria-label={label} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <ComingSoonButton label={label} className={className}>
      {content}
    </ComingSoonButton>
  );
}
