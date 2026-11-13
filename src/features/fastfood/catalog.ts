/** 패스트푸드 키오스크 메뉴판. 연습모드와 실전모드가 함께 쓴다. */

export type BurgerId = "bulgogi" | "cheese" | "chicken" | "spicy";

export type Burger = {
  id: BurgerId;
  name: string;
  /** 단품 가격 */
  price: number;
  /** 세트(버거 + 감자튀김 + 콜라) 가격 */
  setPrice: number;
};

/** 세트는 단품보다 2,400원 비싸다 (불고기버거 4,800원 → 세트 7,200원) */
const SET_EXTRA_PRICE = 2400;

export const BURGERS: readonly Burger[] = [
  { id: "bulgogi", name: "불고기버거", price: 4800, setPrice: 4800 + SET_EXTRA_PRICE },
  { id: "cheese", name: "치즈버거", price: 5300, setPrice: 5300 + SET_EXTRA_PRICE },
  { id: "chicken", name: "치킨버거", price: 5500, setPrice: 5500 + SET_EXTRA_PRICE },
  { id: "spicy", name: "매운버거", price: 5800, setPrice: 5800 + SET_EXTRA_PRICE },
];

export const BURGER_CATEGORIES = ["추천", "버거", "사이드", "음료", "디저트"] as const;
/** 메뉴판이 처음 열릴 때 선택된 분류 */
export const DEFAULT_BURGER_CATEGORY = "버거";

/** 세트 구성 설명 */
export const SET_CONTENTS = "버거 + 감자튀김 + 콜라";
export const SINGLE_CONTENTS = "버거만";

export function getBurger(id: BurgerId): Burger {
  const burger = BURGERS.find((item) => item.id === id);
  if (!burger) throw new Error(`없는 버거예요: ${id}`);
  return burger;
}
