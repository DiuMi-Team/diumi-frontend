/** 카페 키오스크 메뉴판. 연습모드와 실전모드가 함께 쓴다. */

export type CafeMenuId = "americano" | "latte" | "coldbrew" | "mocha";
export type Temperature = "hot" | "ice";
export type CupSize = "regular" | "large" | "extra";

export type CafeMenu = {
  id: CafeMenuId;
  name: string;
  price: number;
};

export const CAFE_MENUS: readonly CafeMenu[] = [
  { id: "americano", name: "아메리카노", price: 3200 },
  { id: "latte", name: "카페라떼", price: 4200 },
  { id: "coldbrew", name: "콜드브루", price: 4500 },
  { id: "mocha", name: "카페모카", price: 4800 },
];

export const CAFE_CATEGORIES = ["신메뉴", "커피", "디카페인", "음료"] as const;
/** 메뉴판이 처음 열릴 때 선택된 분류 */
export const DEFAULT_CATEGORY = "커피";

/**
 * 사이즈 메뉴. 연습 키오스크는 Regular(기본)·Large(+500원),
 * 실전 키오스크는 Large(기본)·Extra(+700원)라 키오스크마다 고를 수 있는 사이즈와 추가 금액이 다르다.
 * 첫 번째가 기본 사이즈다.
 */
export type SizeMenuId = "practice" | "real";
export type SizeOption = { id: CupSize; extra: number };

export const SIZE_MENUS: Record<SizeMenuId, readonly SizeOption[]> = {
  practice: [
    { id: "regular", extra: 0 },
    { id: "large", extra: 500 },
  ],
  real: [
    { id: "large", extra: 0 },
    { id: "extra", extra: 700 },
  ],
};

export function getSizeOption(menu: SizeMenuId, size: CupSize): SizeOption {
  const option = SIZE_MENUS[menu].find((item) => item.id === size);
  if (!option) throw new Error(`${menu} 키오스크에는 없는 사이즈예요: ${size}`);
  return option;
}

export const TEMPERATURE_LABEL: Record<Temperature, string> = { hot: "HOT", ice: "ICE" };
export const SIZE_LABEL: Record<CupSize, string> = {
  regular: "Regular",
  large: "Large",
  extra: "Extra",
};

export function getCafeMenu(id: CafeMenuId): CafeMenu {
  const menu = CAFE_MENUS.find((item) => item.id === id);
  if (!menu) throw new Error(`없는 메뉴예요: ${id}`);
  return menu;
}

export type PaidOptionId = "shot" | "vanilla" | "hazelnut" | "whip";

export type PaidOption = {
  id: PaidOptionId;
  name: string;
  /** 장바구니 요약처럼 좁은 곳에 쓰는 이름 */
  shortName: string;
  price: number;
};

/** 유료 옵션. 잔마다 붙는 가격이다 */
export const PAID_OPTIONS: readonly PaidOption[] = [
  { id: "shot", name: "샷 추가", shortName: "샷", price: 500 },
  { id: "vanilla", name: "바닐라 시럽", shortName: "바닐라", price: 500 },
  { id: "hazelnut", name: "헤이즐넛 시럽", shortName: "헤이즐넛", price: 500 },
  { id: "whip", name: "휘핑크림", shortName: "휘핑", price: 500 },
];

export function getPaidOption(id: PaidOptionId): PaidOption {
  const option = PAID_OPTIONS.find((item) => item.id === id);
  if (!option) throw new Error(`없는 유료 옵션이에요: ${id}`);
  return option;
}

/** 무료 옵션 (실전 키오스크). 고르지 않으면 기본값으로 만든다 */
export type FreeOptionKey = "ice" | "strength" | "straw";

export type FreeOptionChoice = {
  id: string;
  name: string;
  /** 이름 옆 작은 설명. 예: "물 추가" */
  note?: string;
  /** 장바구니에 보여 줄 짧은 설명. 기본값이면 없다 */
  summary?: string;
};

export type FreeOptionGroup = {
  key: FreeOptionKey;
  label: string;
  defaultId: string;
  choices: readonly FreeOptionChoice[];
};

export const FREE_OPTIONS: readonly FreeOptionGroup[] = [
  {
    key: "ice",
    label: "얼음 양",
    defaultId: "normal",
    choices: [
      { id: "less", name: "적게", summary: "얼음 적게" },
      { id: "normal", name: "보통" },
      { id: "more", name: "많이", summary: "얼음 많이" },
    ],
  },
  {
    key: "strength",
    label: "커피 농도",
    defaultId: "normal",
    choices: [
      { id: "light", name: "연하게", note: "물 추가", summary: "연하게" },
      { id: "normal", name: "기본" },
    ],
  },
  {
    key: "straw",
    label: "빨대",
    defaultId: "take",
    choices: [
      { id: "none", name: "받지 않기", summary: "빨대 없음" },
      { id: "take", name: "받기" },
    ],
  },
];

export function getFreeOptionChoice(key: FreeOptionKey, id: string): FreeOptionChoice {
  const choice = FREE_OPTIONS.find((group) => group.key === key)?.choices.find(
    (item) => item.id === id,
  );
  if (!choice) throw new Error(`없는 무료 옵션이에요: ${key}=${id}`);
  return choice;
}
