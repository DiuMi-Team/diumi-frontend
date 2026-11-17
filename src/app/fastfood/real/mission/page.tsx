import { RealRunner } from "@/components/real/RealRunner";
import { FASTFOOD_REAL_MISSION, missionSetup } from "@/features/real/missions";

export default function FastfoodRealMissionPage() {
  return <RealRunner setup={missionSetup(FASTFOOD_REAL_MISSION)} />;
}
