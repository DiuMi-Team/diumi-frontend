import type { ButtonHTMLAttributes } from "react";
import { MicIcon } from "@/components/icons/ui-icons";

type VoiceButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "type">;

export function VoiceButton({ className = "", ...props }: VoiceButtonProps) {
  return (
    <button
      type="button"
      className={`flex h-14 w-full flex-none items-center justify-center gap-2.5 rounded-full bg-orange text-19 font-bold text-text short:h-12 ${className}`}
      {...props}
    >
      <span className="flex size-9 items-center justify-center rounded-full bg-white-pure short:size-8">
        <MicIcon size={22} />
      </span>
      음성 도우미
    </button>
  );
}
