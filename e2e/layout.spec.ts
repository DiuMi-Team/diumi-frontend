import { expect, test } from "@playwright/test";

const ROUTES = [
  "/",
  "/help",
  "/cafe",
  "/fastfood",
  "/cafe/real",
  "/fastfood/real",
  "/cafe/practice",
  "/cafe/practice/basic",
  "/cafe/practice/options",
  "/cafe/practice/coupon",
  "/fastfood/practice",
  "/fastfood/practice/basic",
  "/fastfood/practice/set",
  "/fastfood/practice/coupon",
];

for (const route of ROUTES) {
  test(`${route}: 기준 폭을 채우고 넓은 화면에서는 480px로 가운데 정렬한다`, async ({ page }) => {
    await page.goto(route);
    const viewport = page.viewportSize()!;
    const box = (await page.getByTestId("app-shell").boundingBox())!;

    expect(box.width).toBe(Math.min(viewport.width, 480));
    expect(box.x).toBe((viewport.width - box.width) / 2);
    expect(box.height).toBeGreaterThanOrEqual(viewport.height);

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test(`${route}: 글자는 16px 이상이고 터치 영역은 48px 이상이다`, async ({ page }) => {
    await page.goto(route);

    const smallText = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
        .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
        .map((el) => el.textContent),
    );
    expect(smallText).toEqual([]);

    const smallTargets = await page.evaluate(() =>
      [...document.querySelectorAll("a, button")]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.height === 0) return false; // 닫힌 안내 창 안의 버튼
          const hitArea = parseFloat(getComputedStyle(el, "::after").height) || 0;
          return Math.max(rect.height, hitArea) < 48;
        })
        .map((el) => el.getAttribute("aria-label") ?? el.textContent),
    );
    expect(smallTargets).toEqual([]);
  });
}

test("IBM Plex Sans KR로 한글을 그린다", async ({ page }) => {
  await page.goto("/");
  const text = page.getByRole("heading", { name: "무엇을 배워볼까요?" });

  const loaded = await text.evaluate(async (el) => {
    const family = getComputedStyle(el).fontFamily.split(",")[0];
    const fonts = await document.fonts.load(`700 30px ${family}`, el.textContent ?? "");
    return { family, faces: fonts.length };
  });
  expect(loaded.family).toContain("IBM Plex Sans KR");
  expect(loaded.faces).toBeGreaterThan(0);
});
