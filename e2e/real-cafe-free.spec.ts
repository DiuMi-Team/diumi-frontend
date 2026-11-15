import { expect, test, type Page } from "@playwright/test";

const main = (page: Page) => page.locator("main");

async function orderAndPay(page: Page, method: "신용·체크카드" | "모바일페이" | "기프트카드") {
  await page.getByRole("button", { name: "매장에서 먹어요" }).click();
  await page.getByRole("button", { name: "카페라떼 4,200원" }).click();
  await page.getByRole("button", { name: "HOT" }).click();
  await page.getByRole("button", { name: "선택 완료" }).click();
  await page.getByRole("button", { name: "결제하기" }).click();
  await page.getByRole("button", { name: "다음" }).click();
  await page.getByRole("button", { name: "다음" }).click();
  await page.getByRole("button", { name: method }).click();
  await page
    .getByRole("button", {
      name: method === "기프트카드" ? "기프트카드 인식 완료" : "결제 완료 확인",
    })
    .click();
}

test("실전 유형 선택에서 자유롭게 체험하기로 들어가면 바로 주문을 시작한다", async ({ page }) => {
  await page.goto("/cafe/real");
  await page.getByRole("link", { name: "자유롭게 체험하기 선택하기" }).click();
  await expect(page).toHaveURL("/cafe/real/free");

  await expect(page.getByText("자유롭게 체험", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "어떻게 이용하시나요?" })).toBeVisible();
  // 미션이 없어 진행바와 미션 칩이 없다
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await expect(page.getByText(/^미션:/)).toHaveCount(0);

  await page.getByRole("button", { name: "이전으로" }).click();
  await expect(page).toHaveURL("/cafe/real");
});

test("아무 메뉴나 주문하고 결제하면 성공·실패 없이 체험 완료를 보여 준다", async ({ page }) => {
  await page.goto("/cafe/real/free");
  await page.getByRole("button", { name: "음성 도우미" }).click();
  await page
    .getByRole("dialog", { name: "AI 음성 도우미" })
    .getByRole("button", { name: "닫기" })
    .click();

  await orderAndPay(page, "신용·체크카드");

  // 자유 체험은 결제 완료 화면 없이 바로 체험 완료로 간다
  await expect(page.getByRole("heading", { name: "주문 체험을 마쳤어요!" })).toBeVisible();
  await expect(main(page)).toContainText("대기번호133");
  const record = page.getByRole("region", { name: "체험 기록" });
  await expect(record).toContainText("소요 시간");
  await expect(record).toContainText("도움 요청1회");
  await expect(main(page)).toContainText("자유 체험은 성공·실패 없이");
  await expect(page.getByText("미션을 성공했어요!")).toHaveCount(0);
  await expect(page.getByRole("navigation", { name: "화면 이동" })).toHaveCount(0);
});

test("한 번 더 체험을 누르면 빈 장바구니로 새로 시작한다", async ({ page }) => {
  await page.goto("/cafe/real/free");
  await orderAndPay(page, "기프트카드");
  await expect(page.getByRole("heading", { name: "주문 체험을 마쳤어요!" })).toBeVisible();

  await page.getByRole("button", { name: "한 번 더 체험" }).click();
  await expect(page.getByRole("heading", { name: "어떻게 이용하시나요?" })).toBeVisible();
  await page.getByRole("button", { name: "포장해서 갈래요" }).click();
  await expect(page.getByText("0개 · 0원")).toBeVisible();
});

test("체험 중 처음으로를 누르면 그만할지 묻는다", async ({ page }) => {
  await page.goto("/cafe/real/free");
  await page.getByRole("button", { name: "처음으로" }).click();
  const dialog = page.getByRole("dialog", { name: "체험을 그만할까요?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "처음으로 가기" }).click();
  await expect(page).toHaveURL("/");
});
