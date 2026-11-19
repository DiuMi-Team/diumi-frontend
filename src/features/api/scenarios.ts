import { apiRequest } from "@/features/api/client";

export type ScenarioType = "CAFE" | "FAST_FOOD";

export type ScenarioSummary = {
  scenarioId: number;
  scenarioType: ScenarioType;
  title: string;
  description: string;
  thumbnailUrl: string;
};

export async function getScenarios(visitorId: string): Promise<ScenarioSummary[]> {
  const data = await apiRequest<{ scenarios: ScenarioSummary[] }>("/scenarios", { visitorId });
  return data.scenarios;
}
