/** 카페 키오스크 메뉴판. 연습모드와 실전모드가 함께 쓴다. */

export type CafeMenuId = "americano" | "latte" | "coldbrew" | "mocha";
export type Temperature = "hot" | "ice";
export type CupSize = "regular" | "large";

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

export const LARGE_EXTRA_PRICE = 500;

export const TEMPERATURE_LABEL: Record<Temperature, string> = { hot: "HOT", ice: "ICE" };
export const SIZE_LABEL: Record<CupSize, string> = { regular: "Regular", large: "Large" };

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
