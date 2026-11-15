import { expect, test, type Page } from "@playwright/test";

const main = (page: Page) => page.locator("main");

async function startMission(page: Page) {
  await page.goto("/cafe/real/mission");
  await expect(page.getByRole("heading", { name: "오늘의 미션" })).toBeVisible();
  await page.getByRole("button", { name: "미션 시작하기" }).click();
  await expect(page.getByText("1 / 9")).toBeVisible();
}

/** 포장 → 아메리카노 → ICE → 선택 완료까지 해서 메뉴 화면으로 돌아온다 */
async function addIcedAmericano(page: Page) {
  await page.getByRole("button", { name: "포장해서 갈래요" }).click();
  await page.getByRole("button", { name: "아메리카노 3,200원" }).click();
  await page.getByRole("button", { name: "ICE" }).click();
  await page.getByRole("button", { name: "선택 완료" }).click();
}

test("실전 유형 선택에서 미션 수행하기로 들어간다", async ({ page }) => {
  await page.goto("/cafe/real");
  await page.getByRole("link", { name: "미션 수행하기 선택하기" }).click();
  await expect(page).toHaveURL("/cafe/real/mission");
  await expect(page.getByText("아이스 아메리카노 Large 2잔을 포장으로 주문하세요.")).toBeVisible();
  const conditions = page.getByRole("region", { name: "완료 조건" });
  await expect(conditions).toContainText("Large 사이즈 · 수량 2잔");
  await expect(conditions).toContainText("카드 결제 완료");
});

test("강조 없이 스스로 아이스 아메리카노 Large 2잔을 포장으로 담고 혜택 화면까지 간다", async ({
  page,
}) => {
  await startMission(page);
  await expect(page.getByText("미션: 아이스 아메리카노 2잔 · 포장 · 카드")).toBeVisible();
  await expect(page.locator("[data-practice-target]")).toHaveCount(0);

  await page.getByRole("button", { name: "포장해서 갈래요" }).click();
  await expect(page.getByText("2 / 9")).toBeVisible();
  await expect(page.getByRole("heading", { name: "메뉴를 선택해 주세요" })).toBeVisible();

  await page.getByRole("button", { name: "아메리카노 3,200원" }).click();
  await expect(page.getByText("3 / 9")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Large/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "ICE" }).click();
  await expect(page.getByRole("button", { name: "ICE" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "수량 더하기" }).click();

  await page.getByRole("button", { name: /무료 옵션/ }).click();
  await expect(page.getByText("옵션 선택 · 무료 옵션")).toBeVisible();
  await page.getByRole("button", { name: "적게" }).click();
  await page.getByRole("button", { name: "무료 옵션 선택 완료" }).click();
  await expect(page.getByRole("button", { name: /무료 옵션/ })).toContainText("얼음 적게");

  await page.getByRole("button", { name: "선택 완료" }).click();
  await expect(page.getByText("4 / 9")).toBeVisible();
  await expect(page.getByRole("heading", { name: "메뉴를 더 담아 보세요" })).toBeVisible();
  await expect(main(page)).toContainText("아이스 아메리카노 Large × 2");
  await expect(main(page)).toContainText("6,400원");

  await page.getByRole("button", { name: "결제하기" }).click();
  await expect(page.getByText("5 / 9")).toBeVisible();
  const cart = page.getByRole("list", { name: "주문 내역" });
  await expect(cart).toContainText("아이스 아메리카노 Large");
  await expect(cart).toContainText("얼음 적게 · 포장");
  await expect(main(page)).toContainText("결제 금액6,400원");

  await page.getByRole("button", { name: "다음" }).click();
  await expect(page.getByText("6 / 9")).toBeVisible();
  await page.getByRole("button", { name: "다음" }).click();
  const dialog = page.getByRole("dialog", { name: "준비 중이에요" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "확인" }).click();
  await expect(dialog).toBeHidden();
});

test("온도를 고르지 않고 선택 완료를 누르면 온도를 고르라고 알려 준다", async ({ page }) => {
  await startMission(page);
  await page.getByRole("button", { name: "포장해서 갈래요" }).click();
  await page.getByRole("button", { name: "아메리카노 3,200원" }).click();

  await page.getByRole("button", { name: "선택 완료" }).click();
  await expect(page.getByTestId("app-shell").getByRole("alert")).toContainText(
    "온도를 먼저 골라 주세요",
  );
  await expect(page.getByText("3 / 9")).toBeVisible();
});

test("장바구니에서 수량을 바꾸면 금액이 바뀌고, 1잔 아래로는 줄지 않는다", async ({ page }) => {
  await startMission(page);
  await addIcedAmericano(page);
  await page.getByRole("button", { name: "결제하기" }).click();

  const minus = page.getByRole("button", { name: "아이스 아메리카노 Large 수량 빼기" });
  await expect(minus).toBeDisabled();
  await page.getByRole("button", { name: "아이스 아메리카노 Large 수량 더하기" }).click();
  await expect(main(page)).toContainText("2잔");
  await expect(main(page)).toContainText("결제 금액6,400원");
  await expect(minus).toBeEnabled();
});

test("유료 옵션에서 휘핑크림을 넣으면 음료 포함 금액이 오르고 옵션 화면에 표시된다", async ({
  page,
}) => {
  await startMission(page);
  await page.getByRole("button", { name: "포장해서 갈래요" }).click();
  await page.getByRole("button", { name: "카페모카 4,800원" }).click();
  await page.getByRole("button", { name: /유료 옵션/ }).click();

  await page.getByRole("button", { name: "휘핑크림 +500원" }).click();
  await expect(main(page)).toContainText("음료 포함 금액5,300원");
  await page.getByRole("button", { name: "유료 옵션 선택 완료" }).click();
  await expect(page.getByRole("button", { name: /유료 옵션/ })).toContainText("휘핑크림 1");
});

test("이전으로는 직전 화면으로 돌아가고, 고른 내용은 그대로 남는다", async ({ page }) => {
  await startMission(page);
  await addIcedAmericano(page);
  await expect(page.getByText("4 / 9")).toBeVisible();

  await page.getByRole("button", { name: "이전으로" }).click();
  await expect(page.getByText("3 / 9")).toBeVisible();
  await page.getByRole("button", { name: "이전으로" }).click();
  await page.getByRole("button", { name: "이전으로" }).click();
  await page.getByRole("button", { name: "이전으로" }).click();
  await expect(page.getByRole("heading", { name: "오늘의 미션" })).toBeVisible();

  await page.getByRole("button", { name: "이전으로" }).click();
  await expect(page).toHaveURL("/cafe/real");
});

test("음성 도우미 버튼을 누르면 도우미 화면이 열리고 닫힌다", async ({ page }) => {
  await startMission(page);
  await page.getByRole("button", { name: "음성 도우미" }).click();
  const sheet = page.getByRole("dialog", { name: "AI 음성 도우미" });
  await expect(sheet).toBeVisible();
  await expect(sheet).toContainText("무엇이 궁금하세요?");
  await expect(sheet).toContainText("포장해서 갈래요를 누르면 돼요.");
  await sheet.getByRole("button", { name: "닫기" }).click();
  await expect(sheet).toBeHidden();
});

test("미션 중 처음으로를 누르면 그만할지 묻는다", async ({ page }) => {
  await startMission(page);
  await page.getByRole("button", { name: "처음으로" }).click();
  const dialog = page.getByRole("dialog", { name: "미션을 그만할까요?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "계속하기" }).click();
  await expect(dialog).toBeHidden();

  await page.getByRole("button", { name: "처음으로" }).click();
  await dialog.getByRole("button", { name: "처음으로 가기" }).click();
  await expect(page).toHaveURL("/");
});
