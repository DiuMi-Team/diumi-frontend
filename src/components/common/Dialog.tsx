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
  /** 아래쪽 버튼들 */
  children: ReactNode;
};

export function Dialog({ open, onClose, title, description, icon, children }: DialogProps) {
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
          <span className="flex size-[72px] items-center justify-center rounded-full bg-orange-light">
            {icon}
          </span>
        )}
        <h2 className="text-26 font-bold">{title}</h2>
        {description && <p className="mb-1.5 text-18 text-text-sub">{description}</p>}
        {children}
      </div>
    </dialog>
  );
}
