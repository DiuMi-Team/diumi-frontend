import type { CafeMenuId, PaidOptionId } from "@/features/cafe/catalog";
import type { BurgerId, SetDrinkId, SideId } from "@/features/fastfood/catalog";

/* 키오스크 화면 그림. design/screens의 SVG를 그대로 옮겼다. */

type IconProps = {
  size: number;
};

const SHADOW = { fill: "#3D3531", opacity: ".12" } as const;

type CupColors = { band: string; lid: string };

const CUP_COLORS: Record<Exclude<CafeMenuId, "coldbrew">, CupColors> = {
  americano: { band: "#F5A65B", lid: "#3D3531" },
  latte: { band: "#F5A65B", lid: "#55A4E3" },
  mocha: { band: "#3D3531", lid: "#F5A65B" },
};

type MenuIconProps = IconProps & {
  menuId: CafeMenuId;
  /** 주문 내역 화면은 바닥 그림자가 없다 */
  shadow?: boolean;
};

export function MenuIcon({ menuId, size, shadow = true }: MenuIconProps) {
  if (menuId === "coldbrew") return <ColdBrewIcon size={size} shadow={shadow} />;
  const { band, lid } = CUP_COLORS[menuId];

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-none">
      {shadow && <ellipse cx="32" cy="59" rx="16" ry="3" {...SHADOW} />}
      <path d="M17 21h30l-3 32a4 4 0 0 1-4 3H24a4 4 0 0 1-4-3z" fill="#DFEBEC" />
      <path d="M18 31h28l-1.3 13H19.3z" fill={band} />
      <rect x="14" y="14" width="36" height="8" rx="4" fill={lid} />
      <rect x="20" y="8" width="24" height="8" rx="3.5" fill={lid} />
    </svg>
  );
}

function ColdBrewIcon({ size, shadow }: IconProps & { shadow: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-none">
      {shadow && <ellipse cx="32" cy="59" rx="15" ry="3" {...SHADOW} />}
      <path d="M38 3l-4 20" stroke="#F5A65B" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M17 14h30l-4 39a4 4 0 0 1-4 3H25a4 4 0 0 1-4-3z" fill="#B9E6E8" />
      <path d="M19 28h26l-2.6 25a3 3 0 0 1-3 3H24.6a3 3 0 0 1-3-3z" fill="#3D3531" />
      <rect x="24" y="22" width="9" height="9" rx="2" fill="#FDFDFD" />
      <rect x="34" y="27" width="8" height="8" rx="2" fill="#FDFDFD" />
    </svg>
  );
}

const COUPON_PATH =
  "M6 19a5 5 0 0 1 5-5h42a5 5 0 0 1 5 5v6a6 6 0 0 0 0 12v6a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5v-6a6 6 0 0 0 0-12z";

/** 미션 선택 카드는 주황, 멤버십·쿠폰 화면은 파랑 */
export function CouponIcon({
  size,
  tone,
  shadow = false,
}: IconProps & { tone: "orange" | "blue"; shadow?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-none">
      {shadow && <ellipse cx="32" cy="57" rx="20" ry="3" {...SHADOW} />}
      <path d={COUPON_PATH} fill={tone === "orange" ? "#F5A65B" : "#55A4E3"} />
      <path
        d="M41 19v24"
        stroke="#FDFDFD"
        strokeWidth="3"
        strokeDasharray="3 5"
        strokeLinecap="round"
      />
      <circle cx="24" cy="31" r="7" fill="#FDFDFD" />
    </svg>
  );
}

export function ClockIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-none">
      <circle cx="32" cy="31" r="26" fill="#F5A65B" />
      <circle cx="32" cy="31" r="19" fill="#FDFDFD" />
      <path
        d="M32 19v12l8 5"
        stroke="#3D3531"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function GuideBookIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-none">
      <path d="M6 14c8-3 17-3 26 2v38c-9-5-18-5-26-2z" fill="#FDFDFD" />
      <path d="M58 14c-8-3-17-3-26 2v38c9-5 18-5 26-2z" fill="#DFEBEC" />
      <path
        d="M12 24c5-1 10-.5 14 1M12 32c5-1 10-.5 14 1M38 25c4-1.5 9-2 14-1M38 33c4-1.5 9-2 14-1"
        stroke="#F5A65B"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function DineInIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="58" rx="20" ry="3" {...SHADOW} />
      <circle cx="32" cy="30" r="20" fill="#F5A65B" />
      <circle cx="32" cy="30" r="13" fill="#FDFDFD" />
      <path
        d="M6 6v16M3 6v9a3 3 0 0 0 6 0V6M6 22v32"
        stroke="#3D3531"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M58 6c-4 3-5 11-1 16h1v32"
        stroke="#3D3531"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function TakeoutIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="60" rx="18" ry="2.5" {...SHADOW} />
      <path
        d="M24 20v-5a8 8 0 0 1 16 0v5"
        stroke="#3D3531"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M12 20h40l-3 34a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4z" fill="#F5A65B" />
      <path d="M32 20h20l-3 34a4 4 0 0 1-4 4H32z" fill="#3D3531" opacity=".08" />
      <circle cx="32" cy="36" r="7" fill="#FDFDFD" />
    </svg>
  );
}

export function HotIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M32 4c4 12 18 18 18 34a18 18 0 0 1-36 0c0-8 4-13 8-16 0 6 3 9 6 9-2-12 0-20 4-27z"
        fill="#F5A65B"
      />
      <path d="M32 32c3 6 9 9 9 16a9 9 0 0 1-18 0c0-6 5-9 9-16z" fill="#FDFDFD" opacity=".7" />
    </svg>
  );
}

export function IceIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 6l22 12v26L32 58 10 44V18z" fill="#B9E6E8" />
      <path d="M32 30l22-12v26L32 58z" fill="#55A4E3" opacity=".5" />
      <path
        d="M10 18l22 12 22-12M32 30v28"
        fill="none"
        stroke="#FDFDFD"
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MembershipStarIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="60" rx="16" ry="2.5" {...SHADOW} />
      <path
        d="M32 6l7.8 16 17.7 2.5-12.8 12.4 3.1 17.6L32 46l-15.8 8.5 3.1-17.6L6.5 24.5 24.2 22z"
        fill="#F5A65B"
        stroke="#F5A65B"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M32 6l7.8 16 17.7 2.5-12.8 12.4 3.1 17.6L32 46z" fill="#3D3531" opacity=".08" />
    </svg>
  );
}

export function MobilePayIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-none">
      <rect x="18" y="3" width="28" height="55" rx="7" fill="#3D3531" />
      <rect x="21" y="8" width="22" height="41" rx="3" fill="#B9E6E8" />
      <circle cx="32" cy="28" r="8" fill="#F5A65B" />
      <path
        d="M28 28l3 3 5-6"
        stroke="#FDFDFD"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export function CreditCardIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-none">
      <ellipse cx="32" cy="57" rx="20" ry="3" {...SHADOW} />
      <rect x="6" y="13" width="52" height="37" rx="8" fill="#55A4E3" />
      <rect x="6" y="21" width="52" height="8" fill="#3D3531" />
      <rect x="13" y="35" width="12" height="9" rx="2.5" fill="#F5A65B" />
      <rect x="31" y="38" width="20" height="4" rx="2" fill="#FDFDFD" opacity=".7" />
    </svg>
  );
}

export function GiftCardIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-none">
      <rect x="9" y="26" width="46" height="30" rx="5" fill="#5AC7C3" />
      <rect x="6" y="18" width="52" height="10" rx="4" fill="#55A4E3" />
      <rect x="29" y="18" width="6" height="38" fill="#F5A65B" />
      <path
        d="M32 18c-4-10-16-10-12-2 2 3 8 2 12 2zM32 18c4-10 16-10 12-2-2 3-8 2-12 2z"
        fill="#F5A65B"
      />
    </svg>
  );
}

export function CardInsertIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <rect
        x="14"
        y="4"
        width="36"
        height="30"
        rx="5"
        fill="#55A4E3"
        transform="rotate(90 32 19)"
      />
      <rect x="24" y="8" width="8" height="10" rx="2" fill="#F5A65B" />
      <path d="M8 44h48v12H8z" fill="#3D3531" />
      <rect x="16" y="48" width="32" height="4" rx="2" fill="#FDFDFD" opacity=".6" />
    </svg>
  );
}

/** 유료 옵션 그림 (샷·바닐라 시럽·헤이즐넛 시럽·휘핑크림) */
export function PaidOptionIcon({ option, size }: IconProps & { option: PaidOptionId }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-none">
      {option === "shot" && (
        <>
          <path d="M16 22h28v22a12 12 0 0 1-12 12h-4a12 12 0 0 1-12-12z" fill="#3D3531" />
          <path d="M44 28h4a7 7 0 0 1 0 14h-4" stroke="#3D3531" strokeWidth="4" fill="none" />
          <path
            d="M24 8c-3 4 3 6 0 10M34 8c-3 4 3 6 0 10"
            stroke="#F5A65B"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      {(option === "vanilla" || option === "hazelnut") && (
        <>
          <rect x="26" y="4" width="12" height="10" rx="3" fill="#3D3531" />
          <path
            d="M24 14h16l6 10v30a5 5 0 0 1-5 5H23a5 5 0 0 1-5-5V24z"
            fill={option === "vanilla" ? "#B9E6E8" : "#F5A65B"}
          />
          <rect x="22" y="32" width="20" height="12" rx="3" fill="#FDFDFD" />
        </>
      )}
      {option === "whip" && (
        <>
          <path
            d="M14 36c-2-10 6-14 12-12 0-10 12-14 18-6 8 0 10 10 6 18z"
            fill="#FDFDFD"
            stroke="#DFEBEC"
            strokeWidth="3"
          />
          <path d="M12 36h40l-5 20a4 4 0 0 1-4 3H21a4 4 0 0 1-4-3z" fill="#F5A65B" />
        </>
      )}
    </svg>
  );
}

/** 휴대폰 쿠폰 바코드를 스캐너에 대는 그림 */
export function BarcodeScanIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      <ellipse cx="60" cy="112" rx="34" ry="5" {...SHADOW} />
      <rect x="22" y="96" width="76" height="10" rx="5" fill="#3D3531" />
      <rect x="34" y="99" width="52" height="4" rx="2" fill="#F5A65B" />
      <rect x="36" y="8" width="48" height="84" rx="10" fill="#3D3531" />
      <rect x="41" y="15" width="38" height="68" rx="5" fill="#FDFDFD" />
      <rect x="45" y="20" width="30" height="10" rx="3" fill="#F5A65B" />
      <path
        d="M47 40v26M50 40v26M54 40v26M56 40v26M60 40v26M63 40v26M65 40v26M69 40v26M71 40v26M73 40v26"
        stroke="#3D3531"
        strokeWidth="2"
      />
      <rect x="47" y="70" width="26" height="4" rx="2" fill="#B9E6E8" />
      <path
        d="M30 88h60"
        stroke="#F5A65B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

/** 버거 그림. 위 빵·채소·패티·아래 빵 색이 버거마다 조금씩 다르다 */
export function BurgerIcon({
  burgerId,
  size,
  shadow = true,
}: IconProps & { burgerId: BurgerId; shadow?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-none">
      {shadow && <ellipse cx="32" cy="59" rx="20" ry="3" {...SHADOW} />}
      <BurgerLayers burgerId={burgerId} />
    </svg>
  );
}

function BurgerLayers({ burgerId }: { burgerId: BurgerId }) {
  return (
    <>
      <path d="M10 30a22 18 0 0 1 44 0z" fill="#F5A65B" />
      {burgerId !== "spicy" && (
        <>
          <circle cx="30" cy="21" r="1.7" fill="#FDFDFD" />
          <circle cx="38" cy="18" r="1.7" fill="#FDFDFD" />
        </>
      )}
      {burgerId === "bulgogi" && <circle cx="43" cy="24" r="1.7" fill="#FDFDFD" />}
      <rect
        x="8"
        y="30"
        width="48"
        height="7"
        rx="3.5"
        fill={burgerId === "chicken" ? "#B9E6E8" : "#5AC7C3"}
      />
      {burgerId === "chicken" ? (
        <rect
          x="11"
          y="37"
          width="42"
          height="8"
          rx="4"
          fill="#F5A65B"
          stroke="#3D3531"
          strokeWidth="2"
        />
      ) : (
        <rect x="11" y="37" width="42" height="8" rx="4" fill="#3D3531" />
      )}
      {burgerId === "cheese" && (
        <path
          d="M10 36h44l-7 8-8-5-7 6-7-6-8 5z"
          fill="#F5A65B"
          stroke="#FDFDFD"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
      <rect x="10" y="45" width="44" height="11" rx="5.5" fill="#F5A65B" />
      {burgerId === "spicy" && (
        <>
          <circle cx="52" cy="14" r="10" fill="#FDFDFD" />
          <path d="M52 6c2 4 6 6 6 10a6 6 0 0 1-12 0c0-3 3-6 6-10z" fill="#F5A65B" />
        </>
      )}
    </>
  );
}

export function FriesIcon({ size }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-none">
      <FriesLayers />
    </svg>
  );
}

function FriesLayers() {
  return (
    <>
      <rect x="20" y="8" width="5" height="26" rx="2" fill="#F5A65B" />
      <rect x="27" y="5" width="5" height="28" rx="2" fill="#F5A65B" />
      <rect x="34" y="7" width="5" height="26" rx="2" fill="#F5A65B" />
      <rect x="41" y="10" width="5" height="24" rx="2" fill="#F5A65B" />
      <path d="M16 24h32l-4 30a3 3 0 0 1-3 3H23a3 3 0 0 1-3-3z" fill="#55A4E3" />
      <circle cx="32" cy="38" r="6" fill="#FDFDFD" />
    </>
  );
}

/** 세트 그림 (버거 + 감자튀김 + 콜라). 가로로 긴 그림이라 width만 받는다 */
export function SetMealIcon({ burgerId, width }: { burgerId: BurgerId; width: number }) {
  return (
    <svg
      width={width}
      height={(width * 64) / 120}
      viewBox="0 0 120 64"
      aria-hidden="true"
      className="flex-none"
    >
      <ellipse cx="60" cy="60" rx="52" ry="3" {...SHADOW} />
      <g transform="translate(70 2) scale(.9)">
        <path d="M38 2l-4 14" stroke="#3D3531" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M17 21h30l-3 32a4 4 0 0 1-4 3H24a4 4 0 0 1-4-3z" fill="#3D3531" />
        <rect x="14" y="14" width="36" height="8" rx="4" fill="#DFEBEC" />
        <circle cx="32" cy="37" r="7" fill="#FDFDFD" />
      </g>
      <g transform="translate(38 6) scale(.85)">
        <FriesLayers />
      </g>
      <g transform="translate(0 8) scale(.85)">
        <BurgerLayers burgerId={burgerId} />
      </g>
    </svg>
  );
}

/** 세트 사이드 그림 (감자튀김·샐러드·치킨너겟) */
export function SideIcon({ sideId, size }: IconProps & { sideId: SideId }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-none">
      {sideId === "fries" && <FriesLayers />}
      {sideId === "salad" && (
        <>
          <circle cx="21" cy="28" r="9" fill="#5AC7C3" />
          <circle cx="32" cy="23" r="10" fill="#B9E6E8" />
          <circle cx="43" cy="28" r="9" fill="#5AC7C3" />
          <circle cx="31" cy="29" r="4" fill="#F5A65B" />
          <path d="M8 32h48a24 22 0 0 1-48 0z" fill="#55A4E3" />
        </>
      )}
      {sideId === "nuggets" && (
        <>
          <rect x="12" y="16" width="16" height="16" rx="7" fill="#F5A65B" />
          <rect x="26" y="12" width="16" height="18" rx="7" fill="#F5A65B" />
          <rect x="38" y="17" width="15" height="15" rx="7" fill="#F5A65B" />
          <path d="M8 28h48l-4 26a3 3 0 0 1-3 3H15a3 3 0 0 1-3-3z" fill="#3D3531" />
        </>
      )}
    </svg>
  );
}

/** 세트 음료 그림 (콜라·제로콜라·오렌지) */
export function SetDrinkIcon({ drinkId, size }: IconProps & { drinkId: SetDrinkId }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" className="flex-none">
      <path d="M38 2l-4 14" stroke="#3D3531" strokeWidth="3.5" strokeLinecap="round" />
      <path
        d="M17 21h30l-3 32a4 4 0 0 1-4 3H24a4 4 0 0 1-4-3z"
        fill={drinkId === "orange" ? "#F5A65B" : "#3D3531"}
      />
      <rect x="14" y="14" width="36" height="8" rx="4" fill="#DFEBEC" />
      {drinkId === "zero" ? (
        <>
          <circle cx="32" cy="37" r="7" fill="#5AC7C3" />
          <circle cx="32" cy="37" r="3.5" fill="none" stroke="#FDFDFD" strokeWidth="2" />
        </>
      ) : (
        <circle cx="32" cy="37" r="7" fill="#FDFDFD" />
      )}
    </svg>
  );
}
