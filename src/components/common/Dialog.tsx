"use client";

import type { ReactNode } from "react";
import { useNativeDialog } from "@/components/common/useNativeDialog";

type DialogProps = {
  open: boolean;
  /** Esc 키로 닫을 때 부른다 */
  onClose: () => void;
  title: string;
  description?: string;
  icon?: ReactNode;
  /** 아이콘 원 색. 삭제처럼 되돌릴 수 없는 일은 danger(빨강) */
  tone?: "default" | "danger";
  /** 아래쪽 버튼들 */
  children: ReactNode;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  icon,
  tone = "default",
  children,
}: DialogProps) {
  const ref = useNativeDialog(open);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto w-[calc(100%-48px)] max-w-[432px] rounded-[32px] bg-white text-text backdrop:bg-text/45"
    >
      <div className="flex flex-col items-center gap-3 px-[22px] pt-7 pb-[22px] text-center">
        {icon && (
          <span
            className={`flex size-[72px] items-center justify-center rounded-full ${
              tone === "danger" ? "bg-error-bg text-error-text" : "bg-orange-light"
            }`}
          >
            {icon}
          </span>
        )}
        {/* 줄을 나눠 보여 줄 제목은 
으로 넘긴다 (예: "카페라떼 1잔을
삭제할까요?") */}
        <h2
          className={`text-26 font-bold whitespace-pre-line ${tone === "danger" ? "leading-[1.35]" : ""}`}
        >
          {title}
        </h2>
        {description && <p className="mb-1.5 text-18 text-text-sub">{description}</p>}
        {children}
      </div>
    </dialog>
  );
}
