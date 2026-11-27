import { expect, test } from "@playwright/test";

/*
 * 휴대폰·브라우저의 뒤로 가기는 체험 안에서 한 단계씩 돌아간다.
 * 연습·실전은 한 주소 안에서 화면이 바뀌어서, 예전에는 뒤로 가기 한 번에 모드·유형 선택으로 나가 버렸다.
 */

test("연습모드에서 뒤로 가기를 누르면 한 단계씩 돌아가고, 오늘의 미션에서 한 번 더 누르면 미션 선택으로 간다", async ({
  page,
}) => {
  await page.goto("/cafe/practice");
  await page.getByRole("link", { name: /아메리카노 1잔 담기/ }).click();
  await expect(page).toHaveURL("/cafe/practice/basic");
  await page.getByRole("button", { name: "연습 시작하기" }).click();

  await page.getByRole("button", { name: "포장해서 갈래요" }).click();
  await page.getByRole("button", { name: "아메리카노 3,200원" }).click();
  await expect(page.getByText("따뜻하게(HOT)를 눌러 보세요")).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL("/cafe/practice/basic");
  await expect(page.getByText("아메리카노를 눌러 보세요")).toBeVisible();

  await page.goBack();
  await expect(page.getByText("포장해서 갈래요를 눌러 보세요")).toBeVisible();

  await page.goBack();
  await expect(page.getByRole("heading", { name: "오늘의 미션" })).toBeVisible();
  await expect(page).toHaveURL("/cafe/practice/basic");

  await page.goBack();
  await expect(page).toHaveURL("/cafe/practice");
});

test("화면 안의 이전으로와 뒤로 가기를 섞어 써도 한 단계씩 돌아간다", async ({ page }) => {
  await page.goto("/cafe/practice");
  await page.getByRole("link", { name: /아메리카노 1잔 담기/ }).click();
  await page.getByRole("button", { name: "연습 시작하기" }).click();
  await page.getByRole("button", { name: "포장해서 갈래요" }).click();
  await page.getByRole("button", { name: "아메리카노 3,200원" }).click();

  await page.getByRole("button", { name: "이전으로" }).click();
  await expect(page.getByText("아메리카노를 눌러 보세요")).toBeVisible();
  await page.goBack();
  await expect(page.getByText("포장해서 갈래요를 눌러 보세요")).toBeVisible();
  await page.getByRole("button", { name: "이전으로" }).click();
  await expect(page.getByRole("heading", { name: "오늘의 미션" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL("/cafe/practice");
});

test("실전 미션에서 뒤로 가기를 누르면 한 화면씩 돌아가고, 미션 확인에서 한 번 더 누르면 유형 선택으로 간다", async ({
  page,
}) => {
  await page.goto("/cafe/real");
  await page.getByRole("link", { name: "미션 수행하기 선택하기" }).click();
  await expect(page).toHaveURL("/cafe/real/mission");
  await page.getByRole("button", { name: "미션 시작하기" }).click();
  await page.getByRole("button", { name: "포장해서 갈래요" }).click();
  await page.getByRole("button", { name: "아메리카노 3,200원" }).click();
  await expect(page.getByText("3 / 9")).toBeVisible();

  await page.goBack();
  await expect(page.getByText("2 / 9")).toBeVisible();
  await expect(page).toHaveURL("/cafe/real/mission");

  await page.goBack();
  await expect(page.getByText("1 / 9")).toBeVisible();

  await page.goBack();
  await expect(page.getByRole("heading", { name: "오늘의 미션" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL("/cafe/real");
});

test("실전 자유 체험의 첫 화면에서 뒤로 가기를 누르면 유형 선택으로 간다", async ({ page }) => {
  await page.goto("/fastfood/real");
  await page.getByRole("link", { name: "자유롭게 체험하기 선택하기" }).click();
  await expect(page).toHaveURL("/fastfood/real/free");
  await page.getByRole("button", { name: "포장해서 가져가기" }).click();
  await expect(page.getByRole("heading", { name: "어디에서 드시나요?" })).toHaveCount(0);

  await page.goBack();
  await expect(page.getByRole("heading", { name: "어디에서 드시나요?" })).toBeVisible();
  await expect(page).toHaveURL("/fastfood/real/free");

  await page.goBack();
  await expect(page).toHaveURL("/fastfood/real");
});
