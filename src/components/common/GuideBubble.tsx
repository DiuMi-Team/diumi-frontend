import type { ReactNode } from "react";
import { HandIcon, WarningIcon } from "@/components/icons/ui-icons";

type GuideBubbleProps = {
  /** error는 연습모드 예외 안내에만 쓴다 */
  variant?: "guide" | "error";
  /** 보조 문구. 예: "선택은 바뀌지 않았어요" */
  detail?: ReactNode;
  children: ReactNode;
};

export function GuideBubble({ variant = "guide", detail, children }: GuideBubbleProps) {
  const isError = variant === "error";

  return (
    <div
      role={isError ? "alert" : undefined}
      className={`flex flex-none items-center gap-3 rounded-[20px] px-3.5 py-3 ${
        isError ? "border-2 border-error bg-error-bg" : "bg-mint-light"
      }`}
    >
      <span
        className={`flex size-10 flex-none items-center justify-center rounded-full ${
          isError ? "bg-error" : "bg-white"
        }`}
      >
        {isError ? <WarningIcon size={24} /> : <HandIcon size={24} />}
      </span>
      <span className="flex flex-col gap-0.5">
        <b className={`text-18 leading-[1.35] font-bold ${isError ? "text-error-text" : ""}`}>
          {children}
        </b>
        {detail && <span className="text-16">{detail}</span>}
      </span>
    </div>
  );
}
