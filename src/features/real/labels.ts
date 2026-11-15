import { getCafeMenu, SIZE_LABEL } from "@/features/cafe/catalog";
import {
  freeOptionSummaries,
  selectedPaidOptions,
  type DineOption,
  type DrinkItem,
} from "@/features/order/order";

/* 실전 키오스크의 음료 이름 표기. 연습과 달리 온도와 사이즈를 이름에 붙인다 */

/** "아이스 아메리카노 Large" */
export function realDrinkName(item: Pick<DrinkItem, "menuId" | "temperature" | "size">): string {
  const prefix =
    item.temperature === "ice" ? "아이스 " : item.temperature === "hot" ? "따뜻한 " : "";
  return `${prefix}${getCafeMenu(item.menuId).name} ${SIZE_LABEL[item.size]}`;
}

const DINE_LABEL: Record<DineOption, string> = { dineIn: "매장", takeout: "포장" };

/** "기본 옵션 · 포장", "휘핑크림 · 얼음 적게 · 포장" */
export function realDrinkDetail(
  item: Pick<DrinkItem, "paidOptions" | "freeOptions">,
  dineOption: DineOption | null,
): string {
  const options = [
    ...selectedPaidOptions(item.paidOptions).map(([option, count]) =>
      count > 1 ? `${option.name} ${count}` : option.name,
    ),
    ...freeOptionSummaries(item.freeOptions),
  ];
  return [
    options.length > 0 ? options.join(" · ") : "기본 옵션",
    dineOption && DINE_LABEL[dineOption],
  ]
    .filter(Boolean)
    .join(" · ");
}
