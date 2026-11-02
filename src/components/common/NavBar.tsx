import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeftIcon, HomeIcon } from "@/components/icons/ui-icons";

type NavBarProps = {
  homeHref?: string;
  backHref: string;
  /** 실전 유형 선택 화면은 버튼이 52px로 더 크다 */
  size?: "md" | "lg";
};

export function NavBar({ homeHref = "/", backHref, size = "md" }: NavBarProps) {
  const padding = size === "lg" ? "py-3" : "py-2.5";
  const height = size === "lg" ? "h-[52px]" : "h-12";

  return (
    <nav
      aria-label="화면 이동"
      className={`flex flex-none gap-3 border-b-2 border-gray-2 bg-gray-1 px-5 ${padding}`}
    >
      <NavLink href={homeHref} className={height}>
        <HomeIcon size={22} />
        처음으로
      </NavLink>
      <NavLink href={backHref} className={height}>
        <ChevronLeftIcon size={22} />
        이전으로
      </NavLink>
    </nav>
  );
}

function NavLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-primary bg-white text-18 font-bold text-primary ${className}`}
    >
      {children}
    </Link>
  );
}
