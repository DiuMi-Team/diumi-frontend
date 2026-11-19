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

test("강조 없이 스스로 아이스 아메리카노 Large 2잔을 포장·카드로 주문하고 미션에 성공한다", async ({
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

  await expect(page.getByText("7 / 9")).toBeVisible();
  await page.getByRole("button", { name: "신용·체크카드" }).click();
  await expect(page.getByText("결제 · 신용·체크카드")).toBeVisible();
  await expect(page.getByText("8 / 9")).toBeVisible();
  await page.getByRole("button", { name: "결제 완료 확인" }).click();

  await expect(page.getByText("9 / 9")).toBeVisible();
  await expect(page.getByRole("heading", { name: "결제가 완료되었습니다" })).toBeVisible();
  await expect(main(page)).toContainText("133");
  // 결제를 마치면 되돌아갈 수 없어 이전으로·음성 도우미가 없다
  await expect(page.getByRole("navigation", { name: "화면 이동" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "음성 도우미" })).toHaveCount(0);
  await page.getByRole("button", { name: "결제 완료 확인" }).click();

  await expect(page.getByRole("heading", { name: "미션을 성공했어요!" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "미션 수행 결과" })).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await expect(page.getByRole("region", { name: "미션 수행 결과" })).toContainText("도움 요청0회");
  await expect(page.getByRole("region", { name: "미션 수행 결과" })).toContainText("초");
  await expect(page.getByRole("region", { name: "완료한 주문" })).toContainText(
    "아이스 아메리카노 Large 2잔 · 포장 · 카드 결제",
  );
  await expect(page.getByRole("region", { name: "미션과 다른 점" })).toHaveCount(0);
});

/** 메뉴를 담고 결제 직전(결제 방식 선택)까지 간다 */
async function goToPayment(page: Page) {
  await page.getByRole("button", { name: "결제하기" }).click();
  await page.getByRole("button", { name: "다음" }).click();
  await page.getByRole("button", { name: "다음" }).click();
  await expect(page.getByText("7 / 9")).toBeVisible();
}

test("미션과 다르게 주문하면 주문은 완료되고, 다른 점과 결과를 보여 준다", async ({ page }) => {
  await startMission(page);
  await page.getByRole("button", { name: "음성 도우미" }).click();
  await page
    .getByRole("dialog", { name: "AI 음성 도우미" })
    .getByRole("button", { name: "닫기" })
    .click();

  await page.getByRole("button", { name: "포장해서 갈래요" }).click();
  await page.getByRole("button", { name: "아메리카노 3,200원" }).click();
  await page.getByRole("button", { name: "ICE" }).click();
  await page.getByRole("button", { name: /^Extra/ }).click();
  await page.getByRole("button", { name: "수량 더하기" }).click();
  await page.getByRole("button", { name: "선택 완료" }).click();
  await goToPayment(page);

  await page.getByRole("button", { name: "모바일페이" }).click();
  await expect(page.getByRole("heading", { name: "모바일페이로 결제해 주세요" })).toBeVisible();
  await page.getByRole("button", { name: "결제 완료 확인" }).click();
  await page.getByRole("button", { name: "결제 완료 확인" }).click();

  await expect(page.getByRole("heading", { name: "주문은 완료됐어요" })).toBeVisible();
  await expect(page.getByText("미션과 다른 부분이 있어요")).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "미션 수행 결과" })).toHaveAttribute(
    "aria-valuenow",
    "50",
  );
  await expect(page.getByRole("region", { name: "미션 수행 결과" })).toContainText("도움 요청1회");
  const differences = page.getByRole("region", { name: "미션과 다른 점" });
  await expect(differences).toContainText("사이즈: Extra를 골랐어요 → 미션은 Large");
  await expect(differences).toContainText("결제: 모바일페이로 결제했어요 → 미션은 신용·체크카드");
  await expect(page.getByRole("region", { name: "완료한 주문" })).toContainText(
    "아이스 아메리카노 Extra 2잔 · 포장 · 모바일페이 결제",
  );
});

test("기프트카드로도 결제할 수 있고, 카드 화면에서는 결제 방법을 다시 고를 수 있다", async ({
  page,
}) => {
  await startMission(page);
  await addIcedAmericano(page);
  await goToPayment(page);

  await page.getByRole("button", { name: "신용·체크카드" }).click();
  await page.getByRole("button", { name: "결제 방법 다시 선택" }).click();
  await expect(page.getByText("7 / 9")).toBeVisible();

  await page.getByRole("button", { name: "기프트카드" }).click();
  await expect(page.getByRole("heading", { name: "기프트카드를 인식해 주세요" })).toBeVisible();
  await expect(main(page)).toContainText("결제 예정 금액3,200원");
  await page.getByRole("button", { name: "기프트카드 인식 완료" }).click();
  await expect(page.getByRole("heading", { name: "결제가 완료되었습니다" })).toBeVisible();
});

test("다시 도전하기를 누르면 미션 확인부터 새로 시작한다", async ({ page }) => {
  await startMission(page);
  await addIcedAmericano(page);
  await goToPayment(page);
  await page.getByRole("button", { name: "신용·체크카드" }).click();
  await page.getByRole("button", { name: "결제 완료 확인" }).click();
  await page.getByRole("button", { name: "결제 완료 확인" }).click();

  await page.getByRole("button", { name: "다시 도전하기" }).click();
  await expect(page.getByRole("heading", { name: "오늘의 미션" })).toBeVisible();
  await page.getByRole("button", { name: "미션 시작하기" }).click();
  await page.getByRole("button", { name: "포장해서 갈래요" }).click();
  await expect(page.getByText("0개 · 0원")).toBeVisible();
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

test("음성 도우미를 열면 AI에 연결하고, 연결할 수 없으면 안내와 다시 연결하기를 보여 준다", async ({
  page,
}) => {
  // e2e는 백엔드에 연결되지 않으므로 연결 실패 안내가 나온다
  await startMission(page);
  await page.getByRole("button", { name: "음성 도우미" }).click();
  const sheet = page.getByRole("dialog", { name: "AI 음성 도우미" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("alert")).toContainText("지금은 AI 도우미에 연결할 수 없어요");
  await expect(sheet.getByRole("button", { name: "질문 말하기" })).toBeDisabled();
  await sheet.getByRole("button", { name: "다시 연결하기" }).click();
  await expect(sheet.getByRole("alert")).toContainText("지금은 AI 도우미에 연결할 수 없어요");
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
