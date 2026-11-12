import type { PracticeMission } from "@/features/practice/types";
import cafeBasicData from "./cafe-basic.json";

/* JSON은 글자 그대로의 타입을 잃으므로 여기서 미션 타입으로 맞춘다. 내용 검증은 missions.test.ts가 한다. */
export const cafeBasic = cafeBasicData as PracticeMission;

export const PRACTICE_MISSIONS: readonly PracticeMission[] = [cafeBasic];
