"use client";

import { useEffect, useRef } from "react";

/** 이 훅이 넣은 방문 기록 칸을 알아보는 표시 */
const GUARD_KEY = "diumiBackGuard";

/** 화면을 떠날 때 남은 칸을 지우는 타이머. 개발 모드 StrictMode가 바로 다시 붙으면 취소한다 */
let releaseTimer: ReturnType<typeof setTimeout> | undefined;

function isGuardOnTop(): boolean {
  return window.history.state?.[GUARD_KEY] === true;
}

function pushGuard() {
  /* Next.js가 pushState를 감싸서 라우터 정보를 이 칸에도 복사해 준다. 주소는 그대로다 */
  window.history.pushState({ [GUARD_KEY]: true }, "");
}

/**
 * 휴대폰·브라우저의 뒤로 가기를 화면 안의 "한 단계 전으로"로 바꾼다.
 * 연습·실전은 한 주소 안에서 단계만 바뀌어서, 그냥 두면 뒤로 가기가 모드 선택 화면까지 나가 버린다.
 *
 * enabled인 동안 같은 주소의 방문 기록을 한 칸 더 쌓아 둔다. 뒤로 가기를 누르면 그 칸이 빠지면서
 * onBack을 부르고, 아직 돌아갈 단계가 남아 있을 수 있으니 칸을 다시 쌓는다. 더 돌아갈 단계가 없어
 * enabled가 false가 되면 쌓아 둔 칸을 지워서, 그다음 뒤로 가기는 원래대로 앞 화면으로 나간다.
 * 화면 안의 "이전으로" 버튼은 방문 기록을 건드리지 않으므로 둘이 어긋나지 않는다.
 */
export function useBrowserBack(enabled: boolean, onBack: () => void) {
  const onBackRef = useRef(onBack);
  useEffect(() => {
    onBackRef.current = onBack;
  });

  useEffect(() => {
    if (!enabled) return;
    clearTimeout(releaseTimer);
    if (!isGuardOnTop()) pushGuard();

    const onPopState = () => {
      /* 앞으로 가기로 쌓아 둔 칸에 다시 올라온 경우는 무시한다 */
      if (isGuardOnTop()) return;
      pushGuard();
      onBackRef.current();
    };
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
      releaseTimer = setTimeout(() => {
        if (isGuardOnTop()) window.history.back();
      }, 0);
    };
  }, [enabled]);
}
