import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeftIcon, HomeIcon } from "@/components/icons/ui-icons";

/** 다른 화면으로 가면 주소, 화면 안에서 상태만 바꾸면(연습모드) 함수 */
type NavTarget = string | (() => void);

type NavBarProps = {
  home?: NavTarget;
  back: NavTarget;
  /** 실전 유형 선택 화면은 버튼이 52px로 더 크다 */
  size?: "md" | "lg";
};

export function NavBar({ home = "/", back, size = "md" }: NavBarProps) {
  const padding = size === "lg" ? "py-3 short:py-2" : "py-2.5 short:py-1";
  const height = size === "lg" ? "h-[52px]" : "h-12";

  return (
    <nav
      aria-label="화면 이동"
      className={`flex flex-none gap-3 border-b-2 border-gray-2 bg-gray-1 px-5 ${padding}`}
    >
      <NavItem target={home} className={height}>
        <HomeIcon size={22} />
        처음으로
      </NavItem>
      <NavItem target={back} className={height}>
        <ChevronLeftIcon size={22} />
        이전으로
      </NavItem>
    </nav>
  );
}

function NavItem({
  target,
  className,
  children,
}: {
  target: NavTarget;
  className: string;
  children: ReactNode;
}) {
  const itemClass = `flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-primary bg-white text-18 font-bold text-primary ${className}`;

  if (typeof target === "string") {
    return (
      <Link href={target} className={itemClass}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={target} className={itemClass}>
      {children}
    </button>
  );
}
