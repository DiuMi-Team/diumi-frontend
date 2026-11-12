import { PracticeRunner } from "@/components/practice/PracticeRunner";
import { cafeOptions } from "@/features/practice/missions";

export default function CafeOptionsPracticePage() {
  return <PracticeRunner mission={cafeOptions} />;
}
