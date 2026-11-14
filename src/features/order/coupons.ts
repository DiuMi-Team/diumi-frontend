/** 휴대폰 바코드로 쓰는 할인 쿠폰. 카페와 패스트푸드가 함께 쓴다 */

export type CouponId = "drink1000" | "set2000";

export type Coupon = {
  id: CouponId;
  name: string;
  description: string;
  discount: number;
};

export const COUPONS: readonly Coupon[] = [
  {
    id: "drink1000",
    name: "1,000원 할인 쿠폰",
    description: "모든 음료에 쓸 수 있어요",
    discount: 1000,
  },
  {
    id: "set2000",
    name: "2,000원 할인 쿠폰",
    description: "세트 메뉴에 쓸 수 있어요",
    discount: 2000,
  },
];

export function getCoupon(id: CouponId): Coupon {
  const coupon = COUPONS.find((item) => item.id === id);
  if (!coupon) throw new Error(`없는 쿠폰이에요: ${id}`);
  return coupon;
}
