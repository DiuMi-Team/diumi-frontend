import { expect, test, type Page } from "@playwright/test";
import {
  expectSeniorFriendly,
  practiceAlert,
  pressDimmed,
  startMission,
  target,
} from "./practice-helpers";

/** 카페 쿠폰 미션(PD01~PD09)의 각 화면 안내 문구 */
const GUIDES = [
  "주문 내역을 확인하고 다음을 눌러 보세요",
  "쿠폰 사용을 눌러 보세요",
  "바코드를 찍었어요를 눌러 보세요",
  "할인된 금액을 확인하고 다음을 눌러 보세요",
  "신용·체크카드를 눌러 보세요",
  "카드를 넣었어요를 눌러 보세요",
  "대기번호를 확인하고 확인을 눌러 보세요",
];

const guideBubble = (page: Page, text: string) =>
  page.locator("main").getByText(text, { exact: true });

async function startCoupon(page: Page) {
  await startMission(page, "/cafe/practice/coupon");
}

/** 안내를 따라 from번째 화면에서 index번째 화면(0부터)까지 간다 */
async function goToStep(page: Page, index: number, from = 0) {
  for (const guide of GUIDES.slice(from, index)) {
    await expect(guideBubble(page, guide)).toBeVisible();
    await target(page).click();
  }
  await expect(guideBubble(page, GUIDES[index])).toBeVisible();
}

test("미션 선택에서 쿠폰 미션으로 들어간다", async ({ page }) => {
  await page.goto("/cafe/practice");
  await page.getByRole("link", { name: /쿠폰 쓰고 결제하기/ }).click();
  await expect(page).toHaveURL("/cafe/practice/coupon");
  await expect(page.getByText("카페라떼 1잔이 담긴 상태에서 시작해요")).toBeVisible();
});

test("카페라떼 1잔이 담긴 상태에서 1,000원 쿠폰을 쓰고 3,200원을 결제한다", async ({ page }) => {
  await startCoupon(page);

  await expect(guideBubble(page, GUIDES[0])).toBeVisible();
  await expect(page.getByRole("list", { name: "주문 내역" })).toContainText("HOT · Regular · 포장");
  await expect(page.locator("main")).toContainText("결제 금액4,200원");

  await goToStep(page, 3);
  await expect(page.getByRole("heading", { name: "쿠폰이 적용되었어요" })).toBeVisible();
  await expect(page.locator("main")).toContainText("주문 금액4,200원");
  await expect(page.locator("main")).toContainText("쿠폰 할인−1,000원");
  await expect(page.locator("main")).toContainText("결제할 금액3,200원");

  await goToStep(page, 4, 3);
  await expect(page.locator("main")).toContainText("결제 금액 3,200원 (쿠폰 1,000원 할인)");

  await goToStep(page, 5, 4);
  await expect(page.locator("main")).toContainText("결제 금액 3,200원");

  await goToStep(page, 6, 5);
  await expect(page.getByText("135")).toBeVisible();
  await target(page).click();

  await expect(page.getByRole("heading", { name: "연습을 마쳤어요!" })).toBeVisible();
  const summary = page.getByRole("list", { name: "연습한 내용" });
  await expect(summary).toContainText("1,000원 할인 쿠폰 사용");
  await expect(summary).toContainText("카드 결제 3,200원");
});

test("쿠폰 사용 대신 다른 곳을 누르면 눌러야 할 곳을 알려 준다", async ({ page }) => {
  await startCoupon(page);
  await goToStep(page, 1);

  await pressDimmed(page, "적립·쿠폰 없이 진행");
  await expect(practiceAlert(page)).toContainText(
    "다른 곳을 눌렀어요. 주황 테두리의 쿠폰 사용을 눌러 보세요",
  );
});

test("쿠폰을 쓴 뒤 이전으로 돌아가면 할인이 취소된다", async ({ page }) => {
  await startCoupon(page);
  await goToStep(page, 4);
  await expect(page.locator("main")).toContainText("(쿠폰 1,000원 할인)");

  await page.getByRole("button", { name: "이전으로" }).click();
  await page.getByRole("button", { name: "이전으로" }).click();
  await expect(guideBubble(page, GUIDES[2])).toBeVisible();

  await page.getByRole("button", { name: "이전으로" }).click();
  await page.getByRole("button", { name: "이전으로" }).click();
  await expect(guideBubble(page, GUIDES[0])).toBeVisible();
  await expect(page.locator("main")).toContainText("결제 금액4,200원");
  await expect(page.locator("main")).not.toContainText("쿠폰 할인");
});

test("모든 단계에서 글자는 16px 이상, 터치 영역은 48px 이상이고 가로로 넘치지 않는다", async ({
  page,
}) => {
  await startCoupon(page);
  for (const guide of GUIDES) {
    await expect(guideBubble(page, guide)).toBeVisible();
    await expectSeniorFriendly(page);
    await target(page).click();
  }
});
