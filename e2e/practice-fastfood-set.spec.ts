import { expect, test, type Page } from "@playwright/test";
import {
  expectSeniorFriendly,
  practiceAlert,
  pressDimmed,
  startMission,
  target,
} from "./practice-helpers";

/** 패스트푸드 세트+단품 미션(PB01~PB17)의 각 화면 안내 문구 */
const GUIDES = [
  "매장에서 먹어요를 눌러 보세요",
  "불고기버거를 눌러 보세요",
  "세트를 눌러 보세요",
  "사이드에서 감자튀김을 눌러 보세요",
  "음료에서 제로콜라를 눌러 보세요",
  "선택 완료를 눌러 보세요",
  "장바구니 담기를 눌러 보세요",
  "이번엔 치즈버거를 눌러 보세요",
  "이번에는 단품을 눌러 보세요",
  "장바구니 담기를 눌러 보세요",
  "주문 내역 확인 후 결제하기를 눌러 보세요",
  "주문 내역을 확인하고 주문 확인을 눌러 보세요",
  "신용·체크카드를 눌러 보세요",
  "카드를 넣었어요를 눌러 보세요",
  "주문번호를 확인하고 확인을 눌러 보세요",
];

const guideBubble = (page: Page, text: string) =>
  page.locator("main").getByText(text, { exact: true });

async function startSet(page: Page) {
  await startMission(page, "/fastfood/practice/set");
}

async function goToStep(page: Page, index: number, from = 0) {
  for (const guide of GUIDES.slice(from, index)) {
    await expect(guideBubble(page, guide)).toBeVisible();
    await target(page).click();
  }
  await expect(guideBubble(page, GUIDES[index])).toBeVisible();
}

test("미션 선택에서 세트+단품 미션으로 들어간다", async ({ page }) => {
  await page.goto("/fastfood/practice");
  await page.getByRole("link", { name: /치즈버거 단품 담기/ }).click();
  await expect(page).toHaveURL("/fastfood/practice/set");
  await expect(page.getByText("사이드 감자튀김 · 음료는 제로콜라로 변경")).toBeVisible();
});

test("안내를 따라 불고기버거 세트와 치즈버거 단품을 담고 12,500원을 결제한다", async ({ page }) => {
  await startSet(page);

  await goToStep(page, 3);
  await expect(page.getByRole("heading", { name: "세트 메뉴를 구성해 주세요" })).toBeVisible();
  // "기본"은 추가 금액이 없다는 표시일 뿐, 처음에는 아무것도 골라져 있지 않다
  await expect(page.getByRole("button", { name: "감자튀김 기본" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.getByRole("button", { name: "콜라 기본" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );

  await goToStep(page, 5, 3);
  await expect(page.getByRole("button", { name: "감자튀김 기본" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "제로콜라 +0원" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await goToStep(page, 6, 5);
  await expect(page.getByText("불고기버거 세트", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText("사이드감자튀김 ›");
  await expect(page.locator("main")).toContainText("음료제로콜라 ›");
  await expect(page.locator("main")).toContainText("금액7,200원");

  await goToStep(page, 7, 6);
  await expect(page.getByRole("heading", { name: "메뉴를 더 골라 보세요" })).toBeVisible();
  await expect(page.getByText("불고기버거 세트 (감자튀김·제로콜라) × 1")).toBeVisible();

  await goToStep(page, 10, 7);
  await expect(page.getByText("치즈버거 단품 × 1")).toBeVisible();
  await expect(page.locator("main")).toContainText("12,500원");

  await goToStep(page, 11, 10);
  const review = page.getByRole("list", { name: "주문 내역" });
  await expect(review).toContainText("감자튀김 · 제로콜라");
  await expect(review).toContainText("버거만");

  await goToStep(page, 14, 11);
  await expect(page.getByText("A-127")).toBeVisible();
  await target(page).click();

  await expect(page.getByRole("heading", { name: "연습을 마쳤어요!" })).toBeVisible();
  const summary = page.getByRole("list", { name: "연습한 내용" });
  await expect(summary).toContainText("불고기버거 세트 · 감자튀김 · 제로콜라");
  await expect(summary).toContainText("카드 결제 12,500원");
});

test("단품을 골라야 할 때 세트를 누르면 맞춤 안내가 뜨고 세트는 담기지 않는다 (PX3)", async ({
  page,
}) => {
  await startSet(page);
  await goToStep(page, 8);

  await pressDimmed(page, /^세트/);
  await expect(practiceAlert(page)).toContainText("치즈버거는 단품이에요. 단품을 눌러 보세요");
  await expect(practiceAlert(page)).toContainText("세트는 담기지 않았어요");
  await expect(page.getByText("3단계 / 총 4단계")).toBeVisible();

  await target(page).click();
  await expect(practiceAlert(page)).toHaveCount(0);
  await expect(page.getByText("치즈버거 단품", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText("구성버거만");
});

test("세트를 고른 뒤 이전으로 돌아가면 사이드·음료 선택도 되돌아간다", async ({ page }) => {
  await startSet(page);
  await goToStep(page, 5);
  await expect(page.getByRole("button", { name: "제로콜라 +0원" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByRole("button", { name: "이전으로" }).click();
  await expect(guideBubble(page, GUIDES[4])).toBeVisible();
  await expect(page.getByRole("button", { name: "제로콜라 +0원" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.getByRole("button", { name: "감자튀김 기본" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("모든 단계에서 글자는 16px 이상, 터치 영역은 48px 이상이고 가로로 넘치지 않는다", async ({
  page,
}) => {
  await startSet(page);
  for (const guide of GUIDES) {
    await expect(guideBubble(page, guide).first()).toBeVisible();
    await expectSeniorFriendly(page);
    await target(page).click();
  }
});
