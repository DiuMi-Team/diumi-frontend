import { PracticeRunner } from "@/components/practice/PracticeRunner";
import { cafeBasic } from "@/features/practice/missions";

export default function CafeBasicPracticePage() {
  return <PracticeRunner mission={cafeBasic} />;
}
