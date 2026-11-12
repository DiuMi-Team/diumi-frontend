"use client";

import { useEffect } from "react";

/**
 * 아이폰 사파리는 터치 리스너가 하나도 없으면 :active 스타일을 적용하지 않는다.
 * 빈 touchstart 리스너를 등록해 손가락으로 누르는 동안 버튼이 눌린 모양으로 보이게 한다.
 */
export function TouchActiveSupport() {
  useEffect(() => {
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  }, []);

  return null;
}
