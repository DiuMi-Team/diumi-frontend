import type { ReactNode } from "react";
import { BurgerIcon, MenuIcon } from "@/components/icons/kiosk-icons";
import { formatWon, type CartItem, type DraftItem } from "@/features/order/order";

/* 카페 키오스크 화면들이 함께 쓰는 모양 */

export const KIOSK_PRIMARY_CLASS =
  "flex h-[60px] w-full flex-none items-center justify-center gap-2 rounded-full bg-primary text-21 font-bold text-white-pure short:h-14";

export const KIOSK_OUTLINE_CLASS =
  "flex h-14 w-full flex-none items-center justify-center rounded-full border-2 border-primary bg-white text-19 font-bold text-primary short:h-12";

/** 눌러야 할 곳이 이 묶음 안에 없으면 묶음째 흐리게 하고, 안의 칸은 따로 흐리게 하지 않는다 */
export function groupDim(targetId: string, ids: readonly string[]) {
  const containsTarget = ids.includes(targetId);
  return {
    groupClass: containsTarget ? "" : "opacity-45",
    itemInactiveClass: containsTarget ? "opacity-45" : "",
  };
}

type ScreenHeadingProps = {
  title: string;
  sub?: ReactNode;
};

export function ScreenHeading({ title, sub }: ScreenHeadingProps) {
  return (
    <div>
      <h2 className="mt-0.5 text-22 font-bold">{title}</h2>
      {sub && <p className="mt-0.5 text-16 text-text-sub">{sub}</p>}
    </div>
  );
}

/** "결제 금액 3,200원 (쿠폰 1,000원 할인)" */
export function PaymentAmount({ amount, discount = 0 }: { amount: number; discount?: number }) {
  return (
    <>
      결제 금액 <b className="text-text">{formatWon(amount)}</b>
      {discount > 0 && (
        <>
          {" "}
          <span className="font-bold text-primary">(쿠폰 {formatWon(discount)} 할인)</span>
        </>
      )}
    </>
  );
}

export function Spacer() {
  return <div className="flex-1" />;
}

/** 장바구니 항목 그림. 음료는 컵, 버거는 버거 */
export function ItemIcon({
  item,
  size,
  shadow = true,
}: {
  item: CartItem | DraftItem;
  size: number;
  shadow?: boolean;
}) {
  return item.type === "drink" ? (
    <MenuIcon menuId={item.menuId} size={size} shadow={shadow} />
  ) : (
    <BurgerIcon burgerId={item.menuId} size={size} shadow={shadow} />
  );
}
