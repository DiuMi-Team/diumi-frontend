import { expect, test, type Page } from "@playwright/test";
import {
  expectSeniorFriendly,
  practiceAlert,
  pressDimmed,
  startMission,
  target,
} from "./practice-helpers";

/** 패스트푸드 단품 기본 미션(PE01~PE11)의 각 화면 안내 문구 */
const GUIDES = [
  "매장에서 먹어요를 눌러 보세요",
  "불고기버거를 눌러 보세요",
  "단품을 눌러 보세요",
  "장바구니 담기를 눌러 보세요",
  "주문 내역 확인 후 결제하기를 눌러 보세요",
  "주문 내역을 확인하고 주문 확인을 눌러 보세요",
  "신용·체크카드를 눌러 보세요",
  "카드를 넣었어요를 눌러 보세요",
  "주문번호를 확인하고 확인을 눌러 보세요",
];

const guideBubble = (page: Page, text: string) =>
  page.locator("main").getByText(text, { exact: true });

async function startBasic(page: Page) {
  await startMission(page, "/fastfood/practice/basic");
}

async function goToStep(page: Page, index: number, from = 0) {
  for (const guide of GUIDES.slice(from, index)) {
    await expect(guideBubble(page, guide)).toBeVisible();
    await target(page).click();
  }
  await expect(guideBubble(page, GUIDES[index])).toBeVisible();
}

test("모드 선택에서 연습모드 → 미션 선택 → 패스트푸드 기본 미션으로 들어간다", async ({ page }) => {
  await page.goto("/fastfood");
  await page.getByRole("link", { name: "연습모드 시작하기" }).click();
  await expect(page).toHaveURL("/fastfood/practice");
  await expect(page.getByText("패스트푸드 키오스크 연습 미션이에요")).toBeVisible();

  await page.getByRole("link", { name: /불고기버거 단품 담기/ }).click();
  await expect(page).toHaveURL("/fastfood/practice/basic");
  await expect(page.getByText("세트 말고 버거만")).toBeVisible();
  await expect(page.getByRole("heading", { name: "오늘의 미션" })).toBeVisible();
});

test("아직 만들지 않은 패스트푸드 미션은 준비 중 안내를 띄운다", async ({ page }) => {
  await page.goto("/fastfood/practice");
  for (const name of [/쿠폰 쓰고 결제하기/]) {
    await page.getByRole("button", { name }).click();
    const dialog = page.getByRole("dialog", { name: "준비 중이에요" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "확인" }).click();
    await expect(dialog).toBeHidden();
  }
});

test("안내를 따라 불고기버거 단품 1개를 매장 식사로 4,800원 결제한다", async ({ page }) => {
  await startBasic(page);
  await expect(page.getByRole("heading", { name: "어디에서 드시나요?" })).toBeVisible();

  await goToStep(page, 2);
  await expect(
    page.getByRole("button", { name: /^세트, 버거 \+ 감자튀김 \+ 콜라, 7,200원/ }),
  ).toBeVisible();
  await expect(target(page)).toHaveAccessibleName("단품, 버거만, 4,800원");

  await goToStep(page, 3, 2);
  await expect(page.getByText("불고기버거 단품", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText("금액4,800원");

  await goToStep(page, 4, 3);
  await expect(page.getByText("불고기버거 단품 × 1")).toBeVisible();

  await goToStep(page, 5, 4);
  const review = page.getByRole("list", { name: "주문 내역" });
  await expect(review).toContainText("불고기버거 단품");
  await expect(review).toContainText("버거만");
  await expect(review).toContainText("1개");
  await expect(page.locator("main")).toContainText("이용 방법매장");

  await goToStep(page, 6, 5);
  await expect(page.getByRole("button", { name: "쿠폰·포인트" })).toBeVisible();

  await goToStep(page, 8, 6);
  await expect(page.getByText("주문번호", { exact: true })).toBeVisible();
  await expect(page.getByText("A-128")).toBeVisible();
  await target(page).click();

  await expect(page.getByRole("heading", { name: "연습을 마쳤어요!" })).toBeVisible();
  const summary = page.getByRole("list", { name: "연습한 내용" });
  await expect(summary).toContainText("불고기버거 단품 1개");
  await expect(summary).toContainText("카드 결제 4,800원");

  await page.getByRole("link", { name: "한 번 더 연습" }).click();
  await expect(page).toHaveURL("/fastfood/practice");
});

test("세트 대신 다른 곳을 누르면 눌러야 할 곳을 알려 준다", async ({ page }) => {
  await startBasic(page);
  await goToStep(page, 2);

  await pressDimmed(page, /^세트/);
  await expect(practiceAlert(page)).toContainText(
    "다른 곳을 눌렀어요. 주황 테두리의 단품을 눌러 보세요",
  );
  await expect(practiceAlert(page)).toContainText("선택은 바뀌지 않았어요");
});

test("모든 단계에서 글자는 16px 이상, 터치 영역은 48px 이상이고 가로로 넘치지 않는다", async ({
  page,
}) => {
  await startBasic(page);
  for (const guide of GUIDES) {
    await expect(guideBubble(page, guide)).toBeVisible();
    await expectSeniorFriendly(page);
    await target(page).click();
  }
});
