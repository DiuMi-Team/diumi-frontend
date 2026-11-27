import type { SessionResult } from "@/features/api/session";
import { CODE_LABELS } from "@/features/real/actions";

/**
 * 실전 미션 결과 판정. 판정은 백엔드가 하고(GET /result), 여기서는 결과 화면에 맞게 바꾸기만 한다.
 * 프론트에서 따로 판정하지 않는다. 서버 결과를 못 받으면 결과 화면이 "불러오지 못했어요"를 보여 준다.
 */

export type ConditionResult = {
  /** 완료 조건 문구. 예: "포장 선택" */
  label: string;
  ok: boolean;
  /** 틀렸을 때 미션과 다른 점. 예: "매장 식사를 골랐어요 (미션: 포장 선택)" */
  differences: string[];
  /** 맞혔을 때 잘한 점. 예: "포장을 골랐어요". 틀렸으면 null */
  goodPoint: string | null;
};

export type MissionJudgement = {
  success: boolean;
  /** 맞힌 완료 조건 비율 (0~100) */
  percent: number;
  conditions: ConditionResult[];
};

/**
 * 목적격 조사. 한글은 받침이 있으면 "을", 없으면 "를".
 * 영어는 읽었을 때 끝소리로 정한다 (HOT·ICE → 을·를, Large·Extra·Regular → 를).
 */
export function objectParticle(word: string): "을" | "를" {
  const last = word.trim().at(-1) ?? "";
  const code = last.charCodeAt(0) - 0xac00;
  if (code >= 0 && code <= 11171) return code % 28 === 0 ? "를" : "을";
  return /[lmnt]$/i.test(word.trim()) && !/(ar|ra|ge)$/i.test(word.trim()) ? "을" : "를";
}

/** 방향 조사. 받침이 없거나 ㄹ 받침이면 "로", 아니면 "으로" (카드로, 모바일페이로, 현금으로) */
export function directionParticle(word: string): "으로" | "로" {
  const last = word.trim().at(-1) ?? "";
  const code = last.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return "로";
  const final = code % 28;
  return final === 0 || final === 8 ? "로" : "으로";
}

/**
 * 맞힌 완료 조건을 잘한 점 문장으로 바꾼다. 서버가 문장(detail)을 주면 그것을 쓴다.
 * - "포장 선택" → "포장을 골랐어요"
 * - "카드 결제 완료" → "카드로 결제했어요"
 * - 그 밖의 조건은 "Large 사이즈 · 수량 2잔"처럼 조건 문구 그대로 둔다
 */
export function goodPointText(condition: string, detail?: string | null): string {
  if (detail) return readableDetail(detail);
  const label = condition.trim();
  const payment = label.match(/^(.+?)\s*결제(?:\s*완료)?$/);
  if (payment) return `${payment[1]}${directionParticle(payment[1])} 결제했어요`;
  const select = label.match(/^(.+?)\s*선택$/);
  if (select) return `${select[1]}${objectParticle(select[1])} 골랐어요`;
  return label;
}

/**
 * 서버 문장 안의 백엔드 코드를 이름으로 바꾼다. 뒤에 붙은 목적격 조사도 이름에 맞춘다.
 * 예: "SIDE_NUGGETS를 골랐어요" → "치킨너겟을 골랐어요". 모르는 코드는 그대로 둔다.
 */
export function readableDetail(detail: string): string {
  return detail.replace(/\b([A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+)(을|를)?/g, (match, code, particle) => {
    const label = CODE_LABELS[code];
    if (!label) return match;
    return particle ? `${label}${objectParticle(label)}` : label;
  });
}

/** 백엔드 수행 결과를 결과 화면 판정으로 바꾼다. 조건이 없으면(자유 체험 등) null */
export function judgementFromServer(result: SessionResult): MissionJudgement | null {
  if (!result.conditions?.length) return null;
  const passed = result.conditions.filter((condition) => condition.passed).length;
  return {
    success: result.isSuccess === true,
    percent: result.conditionPassRate ?? Math.round((passed / result.conditions.length) * 100),
    conditions: result.conditions.map((condition) => ({
      label: condition.condition,
      ok: condition.passed,
      differences:
        !condition.passed && condition.detail
          ? [`${readableDetail(condition.detail)} (미션: ${condition.condition})`]
          : [],
      goodPoint: condition.passed ? goodPointText(condition.condition, condition.detail) : null,
    })),
  };
}
