import { expect, test, type Page } from "@playwright/test";
import {
  expectSeniorFriendly,
  practiceAlert,
  pressDimmed,
  startMission,
  target,
} from "./practice-helpers";

/** 패스트푸드 쿠폰 미션(PF01~PF09)의 각 화면 안내 문구 */
const GUIDES = [
  "주문 내역을 확인하고 주문 확인을 눌러 보세요",
  "쿠폰·포인트를 눌러 보세요",
  "바코드를 찍었어요를 눌러 보세요",
  "할인된 금액을 확인하고 다음을 눌러 보세요",
  "신용·체크카드를 눌러 보세요",
  "카드를 넣었어요를 눌러 보세요",
  "주문번호를 확인하고 확인을 눌러 보세요",
];

const guideBubble = (page: Page, text: string) =>
  page.locator("main").getByText(text, { exact: true });

async function startCoupon(page: Page) {
  await startMission(page, "/fastfood/practice/coupon");
}

async function goToStep(page: Page, index: number, from = 0) {
  for (const guide of GUIDES.slice(from, index)) {
    await expect(guideBubble(page, guide)).toBeVisible();
    await target(page).click();
  }
  await expect(guideBubble(page, GUIDES[index])).toBeVisible();
}

test("미션 선택에서 패스트푸드 쿠폰 미션으로 들어간다", async ({ page }) => {
  await page.goto("/fastfood/practice");
  await page.getByRole("link", { name: /쿠폰 쓰고 결제하기/ }).click();
  await expect(page).toHaveURL("/fastfood/practice/coupon");
  await expect(page.getByText("불고기버거 세트 1개가 담긴 상태에서 시작해요")).toBeVisible();
});

test("불고기버거 세트가 담긴 상태에서 2,000원 쿠폰을 쓰고 5,200원을 결제한다", async ({ page }) => {
  await startCoupon(page);

  await expect(guideBubble(page, GUIDES[0])).toBeVisible();
  await expect(page.getByRole("list", { name: "주문 내역" })).toContainText("감자튀김 · 제로콜라");
  await expect(page.locator("main")).toContainText("결제 금액7,200원");

  await goToStep(page, 1);
  await expect(target(page)).toHaveAccessibleName("쿠폰·포인트");

  await goToStep(page, 3, 1);
  await expect(page.getByText("2,000원 할인 쿠폰")).toBeVisible();
  await expect(page.getByText("세트 메뉴에 쓸 수 있어요")).toBeVisible();
  await expect(page.locator("main")).toContainText("쿠폰 할인−2,000원");
  await expect(page.locator("main")).toContainText("결제할 금액5,200원");

  await goToStep(page, 4, 3);
  await expect(page.locator("main")).toContainText("결제 금액 5,200원 (쿠폰 2,000원 할인)");
  const couponRow = page.getByRole("button", { name: /쿠폰·포인트/ });
  await expect(couponRow).toContainText("−2,000원 적용");
  await expect(couponRow).toHaveAttribute("aria-pressed", "true");

  await goToStep(page, 6, 4);
  await expect(page.getByText("A-129")).toBeVisible();
  await target(page).click();

  await expect(page.getByRole("heading", { name: "연습을 마쳤어요!" })).toBeVisible();
  const summary = page.getByRole("list", { name: "연습한 내용" });
  await expect(summary).toContainText("2,000원 할인 쿠폰 사용");
  await expect(summary).toContainText("카드 결제 5,200원");
});

test("쿠폰·포인트 대신 카드를 먼저 누르면 눌러야 할 곳을 알려 준다", async ({ page }) => {
  await startCoupon(page);
  await goToStep(page, 1);

  await pressDimmed(page, "신용·체크카드");
  await expect(practiceAlert(page)).toContainText(
    "다른 곳을 눌렀어요. 주황 테두리의 쿠폰·포인트를 눌러 보세요",
  );
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
