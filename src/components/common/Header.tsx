import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

type HeaderProps = {
  /** 오른쪽에 놓을 HeaderChip 또는 HeaderLink */
  right?: ReactNode;
};

export function Header({ right }: HeaderProps) {
  return (
    <header className="flex h-16 flex-none items-center justify-between bg-gray-2 px-5">
      <Link
        href="/"
        aria-label="디우미 홈"
        className="relative flex items-center after:absolute after:inset-x-0 after:-inset-y-1"
      >
        <Image src="/logo/diumi-logo.svg" alt="" width={120} height={40} priority />
      </Link>
      {right}
    </header>
  );
}

type HeaderChipProps = {
  /** 긴 문구("실전 · 패스트푸드", "연습 · 카페")는 작은 칩을 쓴다 */
  compact?: boolean;
  children: ReactNode;
};

export function HeaderChip({ compact = false, children }: HeaderChipProps) {
  const size = compact ? "px-3.5 text-16" : "px-4 text-17";
  return <span className={`rounded-full bg-white py-1.5 font-bold ${size}`}>{children}</span>;
}

type HeaderLinkProps = {
  href: string;
  label: string;
  children: ReactNode;
};

/** 보이는 높이는 디자인의 44px이고, 터치 영역만 48px로 넓힌다. */
export function HeaderLink({ href, label, children }: HeaderLinkProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="relative flex h-11 items-center gap-1.5 rounded-full bg-white-pure px-[18px] text-17 font-bold after:absolute after:inset-x-0 after:-inset-y-0.5"
    >
      {children}
    </Link>
  );
}
