"use client";

import { useEffect } from "react";
import { ensureVisitor } from "@/features/api/visitor";

/**
 * 앱이 열리면 방문자를 한 번 등록한다(재방문이면 접근 시간 갱신).
 * 받은 visitorId는 저장해 두고 다른 API의 X-Visitor-Id 헤더로 쓴다.
 * 실패해도 화면은 그대로 쓸 수 있어야 하므로 오류는 삼킨다. 다음에 API를 부를 때 다시 시도한다.
 */
export function VisitorRegistration() {
  useEffect(() => {
    ensureVisitor().catch(() => {});
  }, []);

  return null;
}
