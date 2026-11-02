import { expect, test } from "@playwright/test";

test("홈에서 카페 실전 유형 선택까지 갔다가 돌아온다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "카페", exact: true }).click();
  await expect(page).toHaveURL("/cafe");
  await expect(page.getByRole("heading", { name: "어떻게 해볼까요?" })).toBeVisible();

  await page.getByRole("link", { name: "실전모드 시작하기" }).click();
  await expect(page).toHaveURL("/cafe/real");
  await expect(page.getByText("실전 · 카페")).toBeVisible();

  await page.getByRole("link", { name: "이전으로" }).click();
  await expect(page).toHaveURL("/cafe");

  await page.getByRole("link", { name: "디우미 홈" }).click();
  await expect(page).toHaveURL("/");
});

test("패스트푸드 실전 유형 선택의 처음으로는 홈으로 간다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "패스트푸드", exact: true }).click();
  await expect(page).toHaveURL("/fastfood");

  await page.getByRole("link", { name: "실전모드 시작하기" }).click();
  await expect(page).toHaveURL("/fastfood/real");
  await expect(page.getByText("실전 · 패스트푸드")).toBeVisible();

  await page.getByRole("link", { name: "이전으로" }).click();
  await expect(page).toHaveURL("/fastfood");

  await page.goBack();
  await page.getByRole("link", { name: "처음으로" }).click();
  await expect(page).toHaveURL("/");
});

test("도움말은 헤더와 배너에서 열고 닫기로 홈에 돌아온다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "도움말 보기" }).click();
  await expect(page).toHaveURL("/help");
  await page.getByRole("link", { name: "도움말 닫기" }).click();
  await expect(page).toHaveURL("/");

  await page.getByRole("link", { name: /처음이신가요/ }).click();
  await expect(page).toHaveURL("/help");
});

const COMING_SOON = [
  { route: "/", name: "열차" },
  { route: "/", name: "길찾기" },
  { route: "/cafe", name: "연습모드 시작하기" },
  { route: "/fastfood", name: "연습모드 시작하기" },
  { route: "/cafe/real", name: "미션 수행하기 선택하기" },
  { route: "/fastfood/real", name: "자유롭게 체험하기 선택하기" },
];

for (const { route, name } of COMING_SOON) {
  test(`${route}의 ${name}은 준비 중 안내를 띄우고 닫을 수 있다`, async ({ page }) => {
    await page.goto(route);
    await page.getByRole("button", { name }).click();

    const dialog = page.getByRole("dialog", { name: "준비 중이에요" });
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "확인" }).click();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(route);
  });
}

test("준비 중 안내는 Esc로도 닫힌다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "열차" }).click();
  const dialog = page.getByRole("dialog", { name: "준비 중이에요" });
  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await page.getByRole("button", { name: "열차" }).click();
  await expect(dialog).toBeVisible();
});

test("컴포넌트 미리보기는 배포본에서 404다", async ({ page }) => {
  const response = await page.goto("/dev/components");
  expect(response?.status()).toBe(404);
});
