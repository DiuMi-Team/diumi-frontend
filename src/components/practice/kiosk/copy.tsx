import type { ReactNode } from "react";
import {
  BurgerIcon,
  CouponIcon,
  CreditCardIcon,
  GiftCardIcon,
  MenuIcon,
  MobilePayIcon,
} from "@/components/icons/kiosk-icons";
import { CAFE_CATEGORIES, CAFE_MENUS, DEFAULT_CATEGORY } from "@/features/cafe/catalog";
import { BURGER_CATEGORIES, BURGERS, DEFAULT_BURGER_CATEGORY } from "@/features/fastfood/catalog";
import type { PracticeService } from "@/features/practice/types";

/** 메뉴판 한 칸 */
export type BoardItem = {
  id: string;
  name: string;
  price: number;
  icon: (size: number) => ReactNode;
};

export type PaymentChoice = {
  /** 눌러야 할 곳 id에 쓴다. 예: "payment:card" */
  id: string;
  name: string;
  icon: ReactNode;
};

type KioskCopy = {
  serviceName: string;
  dine: { title: string; sub: string };
  board: { categories: readonly string[]; defaultCategory: string; items: BoardItem[] };
  /** 메뉴판 아래 결제로 넘어가는 버튼 */
  checkout: { label: string; chevron: boolean };
  review: { addMore: string; next: string };
  /** 결제 완료 화면의 번호 이름 */
  numberLabel: string;
  paymentMethods: PaymentChoice[];
};

const CARD: PaymentChoice = {
  id: "payment:card",
  name: "신용·체크카드",
  icon: <CreditCardIcon size={52} />,
};
const MOBILE_PAY: PaymentChoice = {
  id: "payment:mobilePay",
  name: "모바일페이",
  icon: <MobilePayIcon size={52} />,
};
const GIFT_CARD: PaymentChoice = {
  id: "payment:giftCard",
  name: "기프트카드",
  icon: <GiftCardIcon size={52} />,
};

/** 카페와 패스트푸드 키오스크에서 다른 문구·메뉴판·결제 수단 */
export const KIOSK_COPY: Record<PracticeService, KioskCopy> = {
  cafe: {
    serviceName: "카페",
    dine: { title: "어떻게 이용하시나요?", sub: "주문을 받을 방법을 먼저 선택해 주세요" },
    board: {
      categories: CAFE_CATEGORIES,
      defaultCategory: DEFAULT_CATEGORY,
      items: CAFE_MENUS.map((menu) => ({
        id: `menu:${menu.id}`,
        name: menu.name,
        price: menu.price,
        icon: (size) => <MenuIcon menuId={menu.id} size={size} />,
      })),
    },
    checkout: { label: "결제하기", chevron: true },
    review: { addMore: "메뉴 더 담기", next: "다음" },
    numberLabel: "대기번호",
    paymentMethods: [MOBILE_PAY, CARD, GIFT_CARD],
  },
  fastfood: {
    serviceName: "패스트푸드",
    dine: { title: "어디에서 드시나요?", sub: "한 가지를 선택해 주세요" },
    board: {
      categories: BURGER_CATEGORIES,
      defaultCategory: DEFAULT_BURGER_CATEGORY,
      items: BURGERS.map((burger) => ({
        id: `menu:${burger.id}`,
        name: burger.name,
        price: burger.price,
        icon: (size) => <BurgerIcon burgerId={burger.id} size={size} />,
      })),
    },
    checkout: { label: "주문 내역 확인 후 결제하기", chevron: false },
    review: { addMore: "메뉴 추가하기", next: "주문 확인" },
    numberLabel: "주문번호",
    paymentMethods: [
      CARD,
      MOBILE_PAY,
      {
        id: "payment:couponPoint",
        name: "쿠폰·포인트",
        icon: <CouponIcon size={52} tone="orange" />,
      },
      GIFT_CARD,
    ],
  },
};
