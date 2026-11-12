import { expect, type Page } from "@playwright/test";

/** 연습 화면에서 지금 눌러야 할 곳(주황 강조) */
export function target(page: Page) {
  return page.locator("[data-practice-target]");
}

/** 빨간 안내. Next의 화면 이동 알림도 role="alert"라 앱 안으로 좁힌다 */
export function practiceAlert(page: Page) {
  return page.getByTestId("app-shell").getByRole("alert");
}

/**
 * 흐린 칸은 aria-disabled라 Playwright가 누를 수 없는 것으로 보고 기다린다.
 * 실제 사용자는 누를 수 있고 그때 빨간 안내가 떠야 하므로 force로 누른다.
 */
export async function pressDimmed(page: Page, name: string | RegExp) {
  await page.getByRole("button", { name, exact: typeof name === "string" }).click({ force: true });
}

export async function startMission(page: Page, path: string) {
  await page.goto(path);
  await expect(page.getByRole("heading", { name: "오늘의 미션" })).toBeVisible();
  await page.getByRole("button", { name: "연습 시작하기" }).click();
}

/** 글자 16px 이상, 터치 영역 48px 이상, 가로 넘침 없음 */
export async function expectSeniorFriendly(page: Page) {
  const problems = await page.evaluate(() => {
    const smallText = [...document.querySelectorAll("main *")]
      .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
      .map((el) => el.textContent);
    const smallTargets = [...document.querySelectorAll("main a, main button")]
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        const hitArea = parseFloat(getComputedStyle(el, "::after").height) || 0;
        return Math.max(rect.height, hitArea) < 48;
      })
      .map((el) => el.getAttribute("aria-label") ?? el.textContent);
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
    return { smallText, smallTargets, overflow };
  });
  expect(problems).toEqual({ smallText: [], smallTargets: [], overflow: false });
}
