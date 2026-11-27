"use client";

import type { ReactNode } from "react";
import { useNativeDialog } from "@/components/common/useNativeDialog";

type BottomSheetProps = {
  open: boolean;
  /** Esc 키로 닫을 때 부른다 */
  onClose: () => void;
  label: string;
  /** 시트 높이. 기본은 AI 음성 도우미(520px) */
  heightClass?: string;
  children: ReactNode;
};

export function BottomSheet({
  open,
  onClose,
  label,
  heightClass = "h-[520px]",
  children,
}: BottomSheetProps) {
  const ref = useNativeDialog(open);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={`mx-auto mt-auto mb-0 ${heightClass} max-h-[90dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[32px] border-t-4 border-mint bg-white text-text backdrop:bg-black/20`}
    >
      <div className="flex min-h-full flex-col gap-3 px-5 pt-3 pb-5">
        <div className="h-[5px] w-12 flex-none self-center rounded-[3px] bg-gray-2" />
        {children}
      </div>
    </dialog>
  );
}
