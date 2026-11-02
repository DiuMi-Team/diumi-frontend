import { expect, test } from "@playwright/test";

test("기준 폭에서는 화면을 꽉 채우고 넓은 화면에서는 480px로 가운데 정렬한다", async ({ page }) => {
  await page.goto("/");
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

test("IBM Plex Sans KR로 한글을 그린다", async ({ page }) => {
  await page.goto("/");
  const text = page.getByText("디우미를 준비하고 있어요");
  await expect(text).toHaveCSS("font-size", "18px");

  const loaded = await text.evaluate(async (el) => {
    const family = getComputedStyle(el).fontFamily.split(",")[0];
    const fonts = await document.fonts.load(`500 18px ${family}`, el.textContent ?? "");
    return {
      family,
      faces: fonts.length,
      ready: document.fonts.check(`500 18px ${family}`, el.textContent ?? ""),
    };
  });
  expect(loaded.family).toContain("IBM Plex Sans KR");
  expect(loaded.faces).toBeGreaterThan(0);
  expect(loaded.ready).toBe(true);
});
