import type { PracticeMission } from "@/features/practice/types";
import cafeBasicData from "./cafe-basic.json";
import cafeCouponData from "./cafe-coupon.json";
import cafeOptionsData from "./cafe-options.json";
import fastfoodBasicData from "./fastfood-basic.json";
import fastfoodSetData from "./fastfood-set.json";

/* JSON은 글자 그대로의 타입을 잃으므로 여기서 미션 타입으로 맞춘다. 내용 검증은 missions.test.ts가 한다. */
export const cafeBasic = cafeBasicData as PracticeMission;
export const cafeOptions = cafeOptionsData as PracticeMission;
export const cafeCoupon = cafeCouponData as PracticeMission;
export const fastfoodBasic = fastfoodBasicData as PracticeMission;
export const fastfoodSet = fastfoodSetData as PracticeMission;

export const PRACTICE_MISSIONS: readonly PracticeMission[] = [
  cafeBasic,
  cafeOptions,
  cafeCoupon,
  fastfoodBasic,
  fastfoodSet,
];
