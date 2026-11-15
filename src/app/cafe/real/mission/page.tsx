import { RealRunner } from "@/components/real/RealRunner";
import { CAFE_REAL_MISSION, missionSetup } from "@/features/real/missions";

export default function CafeRealMissionPage() {
  return <RealRunner setup={missionSetup(CAFE_REAL_MISSION)} />;
}
