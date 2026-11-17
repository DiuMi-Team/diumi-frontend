import { expect, test, type Page } from "@playwright/test";

const main = (page: Page) => page.locator("main");

async function orderAndPay(page: Page) {
  await page.getByRole("button", { name: "포장해서 가져가기" }).click();
  await page.getByRole("button", { name: "치킨버거 5,500원" }).click();
  await page.getByRole("button", { name: /^단품/ }).click();
  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await page.getByRole("button", { name: "주문 내역 확인 후 결제하기" }).click();
  await page.getByRole("button", { name: "주문 확인" }).click();
  await page.getByRole("button", { name: "기프트카드" }).click();
  await page.getByRole("button", { name: "기프트카드 인식 완료" }).click();
}

test("실전 유형 선택에서 자유롭게 체험하기로 들어가면 바로 주문을 시작한다", async ({ page }) => {
  await page.goto("/fastfood/real");
  await page.getByRole("link", { name: "자유롭게 체험하기 선택하기" }).click();
  await expect(page).toHaveURL("/fastfood/real/free");

  await expect(page.getByText("자유롭게 체험", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "어디에서 드시나요?" })).toBeVisible();
  await expect(page.getByText("한 가지를 선택해 주세요")).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(0);

  await page.getByRole("button", { name: "이전으로" }).click();
  await expect(page).toHaveURL("/fastfood/real");
});

test("아무 메뉴나 주문하고 결제하면 성공·실패 없이 체험 완료를 보여 준다", async ({ page }) => {
  await page.goto("/fastfood/real/free");
  await orderAndPay(page);

  await expect(page.getByRole("heading", { name: "주문 체험을 마쳤어요!" })).toBeVisible();
  await expect(main(page)).toContainText("주문번호A-127");
  await expect(page.getByRole("region", { name: "체험 기록" })).toContainText("도움 요청0회");
  await expect(page.getByText("미션을 성공했어요!")).toHaveCount(0);
});

test("결제 방법 화면은 자유 체험용 안내를 보여 준다", async ({ page }) => {
  await page.goto("/fastfood/real/free");
  await page.getByRole("button", { name: "매장에서 먹기" }).click();
  await page.getByRole("button", { name: "불고기버거 4,800원" }).click();
  await page.getByRole("button", { name: /^단품/ }).click();
  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await page.getByRole("button", { name: "주문 내역 확인 후 결제하기" }).click();
  await page.getByRole("button", { name: "주문 확인" }).click();
  await expect(main(page)).toContainText("선택한 결제 수단의 사용 위치가 표시돼요");
});

test("한 번 더 체험을 누르면 빈 주문으로 새로 시작한다", async ({ page }) => {
  await page.goto("/fastfood/real/free");
  await orderAndPay(page);
  await page.getByRole("button", { name: "한 번 더 체험" }).click();
  await page.getByRole("button", { name: "매장에서 먹기" }).click();
  await expect(page.getByText("0개 · 0원")).toBeVisible();
});
