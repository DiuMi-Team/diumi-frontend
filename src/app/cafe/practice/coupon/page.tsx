import { PracticeRunner } from "@/components/practice/PracticeRunner";
import { cafeCoupon } from "@/features/practice/missions";

export default function CafeCouponPracticePage() {
  return <PracticeRunner mission={cafeCoupon} />;
}
