import type { ReactNode } from "react";

function StatusChip({
  chipClass,
  dotClass,
  children,
}: {
  chipClass: string;
  dotClass: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`flex items-center gap-1.5 self-start rounded-full px-3.5 py-1.5 text-16 font-bold ${chipClass}`}
    >
      <span className={`size-2 flex-none rounded-full ${dotClass}`} aria-hidden="true" />
      {children}
    </span>
  );
}

export function MissionChip({ children }: { children: ReactNode }) {
  return (
    <StatusChip chipClass="bg-gray-2" dotClass="bg-primary">
      미션: {children}
    </StatusChip>
  );
}

export function FreeBadge() {
  return (
    <StatusChip chipClass="bg-mint-light" dotClass="bg-mint">
      자유롭게 체험
    </StatusChip>
  );
}
