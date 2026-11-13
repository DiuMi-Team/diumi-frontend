"use client";

import type { ReactNode } from "react";
import { HotIcon, IceIcon } from "@/components/icons/kiosk-icons";
import { KioskButton, usePractice } from "@/components/practice/PracticeContext";
import { groupDim, KIOSK_PRIMARY_CLASS, Spacer } from "@/components/practice/kiosk/parts";
import {
  getCafeMenu,
  LARGE_EXTRA_PRICE,
  type CupSize,
  type Temperature,
} from "@/features/cafe/catalog";
import { formatWon, itemPrice, paidOptionsSummary } from "@/features/order/order";

const QUANTITY_IDS = ["quantity:decrease", "quantity:increase"];

const TILE_CLASS = "flex items-center justify-center rounded-[18px] text-18 font-bold";
const SELECTED_CLASS = "border-3 border-primary bg-white text-primary";
const UNSELECTED_CLASS = "bg-gray-1";

export function OptionsScreen() {
  const { step, order } = usePractice();
  const draft = order.draft;
  if (draft?.type !== "drink") {
    throw new Error(`${step.id}: 옵션을 고를 음료가 없어요. 미션 데이터를 확인해 주세요`);
  }

  const quantity = groupDim(step.target.id, QUANTITY_IDS);
  /* 수량을 이미 바꿨으면 고른 항목처럼 덜 흐리게 보인다 */
  const quantityGroupClass =
    quantity.groupClass && draft.quantity !== 1 ? "opacity-90" : quantity.groupClass;
  const menuName = getCafeMenu(draft.menuId).name;
  const paidSummary = paidOptionsSummary(draft.paidOptions);

  return (
    <>
      <h2 className="mt-0.5 text-22 font-bold">{menuName} 옵션</h2>

      <div
        className={`flex h-[60px] items-center justify-between rounded-[18px] bg-gray-1 pr-3 pl-[18px] text-18 font-bold short:h-12 ${quantityGroupClass}`}
      >
        수량
        <span className="flex items-center gap-3">
          <QuantityButton
            id="quantity:decrease"
            label="수량 줄이기"
            inactive={quantity.itemInactiveClass}
          >
            −
          </QuantityButton>
          <b className="min-w-5 text-center text-20" aria-label={`수량 ${draft.quantity}잔`}>
            {draft.quantity}
          </b>
          <QuantityButton
            id="quantity:increase"
            label="수량 늘리기"
            inactive={quantity.itemInactiveClass}
          >
            ＋
          </QuantityButton>
        </span>
      </div>

      <OptionGroup label="온도">
        {(["hot", "ice"] as const).map((value) => (
          <TemperatureTile key={value} value={value} selected={draft.temperature === value} />
        ))}
      </OptionGroup>

      <OptionGroup label="사이즈">
        {(["regular", "large"] as const).map((value) => (
          <SizeTile key={value} value={value} selected={draft.size === value} />
        ))}
      </OptionGroup>

      <ExtraOptionRow
        id="options:paid"
        title="유료 옵션"
        examples="샷·시럽·휘핑"
        selected={paidSummary || undefined}
      />
      <ExtraOptionRow id="options:free" title="무료 옵션" examples="얼음·농도·빨대" />

      <Spacer />
      <KioskButton id="options:confirm" className={KIOSK_PRIMARY_CLASS}>
        선택 완료 · {formatWon(itemPrice(draft))}
      </KioskButton>
    </>
  );
}

/** 보이는 크기는 디자인의 40px이고, 터치 영역만 48px로 넓힌다 */
function QuantityButton({
  id,
  label,
  inactive,
  children,
}: {
  id: string;
  label: string;
  inactive: string;
  children: ReactNode;
}) {
  return (
    <KioskButton
      id={id}
      ariaLabel={label}
      inactiveClassName={inactive}
      className="relative flex size-10 items-center justify-center rounded-full bg-white text-24 text-primary after:absolute after:-inset-1"
    >
      {children}
    </KioskButton>
  );
}

function OptionGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-col gap-1.5 short:gap-0.5">
      <span className="text-16 font-bold text-text-sub short:leading-5">{label}</span>
      <div className="grid grid-cols-2 gap-2.5">{children}</div>
    </div>
  );
}

const TEMPERATURE = {
  hot: { name: "따뜻하게", code: "HOT", icon: <HotIcon size={32} /> },
  ice: { name: "차갑게", code: "ICE", icon: <IceIcon size={32} /> },
} satisfies Record<Temperature, { name: string; code: string; icon: ReactNode }>;

function TemperatureTile({ value, selected }: { value: Temperature; selected: boolean }) {
  const { name, code, icon } = TEMPERATURE[value];

  return (
    <KioskButton
      id={`temperature:${value}`}
      tight
      pressed={selected}
      inactiveClassName={selected ? "opacity-90" : undefined}
      className={`${TILE_CLASS} h-[72px] gap-2 short:h-14 ${selected ? SELECTED_CLASS : UNSELECTED_CLASS}`}
    >
      {icon}
      <span className="flex flex-col text-left leading-[1.2]">
        {name}
        <span className={`text-16 font-medium ${selected ? "" : "text-text-sub"}`}>{code}</span>
      </span>
    </KioskButton>
  );
}

const SIZE = {
  regular: { name: "Regular", note: "기본" },
  large: { name: "Large", note: `+${formatWon(LARGE_EXTRA_PRICE)}` },
} satisfies Record<CupSize, { name: string; note: string }>;

function SizeTile({ value, selected }: { value: CupSize; selected: boolean }) {
  const { name, note } = SIZE[value];

  return (
    <KioskButton
      id={`size:${value}`}
      tight
      pressed={selected}
      inactiveClassName={selected ? "opacity-90" : undefined}
      className={`${TILE_CLASS} h-[60px] gap-1.5 short:h-12 ${selected ? SELECTED_CLASS : UNSELECTED_CLASS}`}
    >
      {name}
      <span className={`text-16 font-medium ${selected ? "" : "text-text-sub"}`}>{note}</span>
    </KioskButton>
  );
}

type ExtraOptionRowProps = {
  id: string;
  title: string;
  examples: string;
  /** 고른 옵션 요약. 예: "휘핑크림 1". 있으면 고른 항목 모양으로 보인다 */
  selected?: string;
};

function ExtraOptionRow({ id, title, examples, selected }: ExtraOptionRowProps) {
  if (selected) {
    return (
      <KioskButton
        id={id}
        inactiveClassName="opacity-90"
        className="flex h-14 items-center justify-between rounded-[18px] border-3 border-primary bg-white px-4 text-17 font-bold text-primary short:h-12"
      >
        <span>
          {title} <span className="text-16 font-medium">{selected}</span>
        </span>
        <span className="text-16">변경 ›</span>
      </KioskButton>
    );
  }

  return (
    <KioskButton
      id={id}
      className="flex h-14 items-center justify-between rounded-[18px] bg-gray-1 px-[18px] text-17 font-bold short:h-12"
    >
      <span>
        {title} <span className="text-16 font-medium text-text-sub">{examples}</span>
      </span>
      <span className="text-16 text-text-sub">추가 ›</span>
    </KioskButton>
  );
}
