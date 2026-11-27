import { expect, test, type Page } from "@playwright/test";
import { mockBackend } from "./mock-backend";

const main = (page: Page) => page.locator("main");

async function startMission(page: Page) {
  await page.goto("/fastfood/real/mission");
  await expect(page.getByRole("heading", { name: "오늘의 미션" })).toBeVisible();
  await page.getByRole("button", { name: "미션 시작하기" }).click();
  await expect(page.getByText("1 / 9")).toBeVisible();
}

/** 매장 → 불고기버거 → 세트 → 사이드·음료 → 장바구니 담기까지 해서 메뉴 화면으로 돌아온다 */
async function addBulgogiSet(page: Page, side = "감자튀김 기본", drink = "콜라 기본") {
  await page.getByRole("button", { name: "매장에서 먹기" }).click();
  await page.getByRole("button", { name: "불고기버거 4,800원" }).click();
  await page.getByRole("button", { name: /^세트/ }).click();
  await page.getByRole("button", { name: side }).click();
  await page.getByRole("button", { name: drink }).click();
  await page.getByRole("button", { name: "선택 완료" }).click();
  await page.getByRole("button", { name: "장바구니 담기" }).click();
}

async function payWith(page: Page, method: string) {
  await page.getByRole("button", { name: "주문 내역 확인 후 결제하기" }).click();
  await page.getByRole("button", { name: "주문 확인" }).click();
  await expect(page.getByText("8 / 9")).toBeVisible();
  await page.getByRole("button", { name: method }).click();
  await page.getByRole("button", { name: "결제 완료 확인" }).click();
}

test("실전 유형 선택에서 미션 수행하기로 들어간다", async ({ page }) => {
  await page.goto("/fastfood/real");
  await page.getByRole("link", { name: "미션 수행하기 선택하기" }).click();
  await expect(page).toHaveURL("/fastfood/real/mission");
  await expect(page.getByText("불고기버거 세트 1개를 매장에서 먹도록 주문하세요.")).toBeVisible();
  await expect(page.getByText("사이드: 감자튀김 · 음료: 콜라 · 카드 결제")).toBeVisible();
  const conditions = page.getByRole("region", { name: "완료 조건" });
  await expect(conditions).toContainText("감자튀김 · 콜라 선택");
});

const FASTFOOD_CONDITIONS = [
  "매장 식사 선택",
  "불고기버거 세트 선택",
  "감자튀김 · 콜라 선택",
  "카드 결제 완료",
];

test("강조 없이 스스로 불고기버거 세트를 매장·카드로 주문하고 미션에 성공한다", async ({
  page,
}) => {
  const backend = await mockBackend(page, {
    isSuccess: true,
    conditions: FASTFOOD_CONDITIONS.map((condition) => ({ condition, passed: true })),
  });
  await startMission(page);
  await expect(page.getByText("미션: 불고기버거 세트 · 매장 · 카드")).toBeVisible();
  await expect(page.getByText("패스트푸드는 주문 전에 먼저 선택해요")).toBeVisible();
  await expect(page.locator("[data-practice-target]")).toHaveCount(0);

  await page.getByRole("button", { name: "매장에서 먹기" }).click();
  await expect(page.getByText("2 / 9")).toBeVisible();
  await page.getByRole("button", { name: "불고기버거 4,800원" }).click();

  await expect(page.getByText("3 / 9")).toBeVisible();
  await expect(page.getByRole("heading", { name: "어떤 구성으로 드시나요?" })).toBeVisible();
  await page.getByRole("button", { name: /^세트/ }).click();

  await expect(page.getByText("4 / 9")).toBeVisible();
  // 사이드·음료는 처음에 아무것도 고르지 않은 상태다
  await expect(page.getByRole("button", { name: "감자튀김 기본" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.getByRole("button", { name: "감자튀김 기본" }).click();
  await page.getByRole("button", { name: "콜라 기본" }).click();
  await expect(page.getByRole("button", { name: "콜라 기본" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: "선택 완료" }).click();

  await expect(page.getByText("5 / 9")).toBeVisible();
  await expect(page.getByText("미션: 불고기버거 세트 · 매장 · 카드")).toBeVisible();
  await expect(main(page)).toContainText("불고기버거 세트");
  await expect(main(page)).toContainText("금액7,200원");
  await page.getByRole("button", { name: "장바구니 담기" }).click();

  await expect(page.getByText("6 / 9")).toBeVisible();
  await expect(page.getByRole("heading", { name: "메뉴를 더 골라 보세요" })).toBeVisible();
  await expect(main(page)).toContainText("불고기버거 세트 × 1");
  await page.getByRole("button", { name: "주문 내역 확인 후 결제하기" }).click();

  await expect(page.getByText("7 / 9")).toBeVisible();
  const review = page.getByRole("list", { name: "주문 내역" });
  await expect(review).toContainText("감자튀김 · 콜라");
  await expect(main(page)).toContainText("이용 방법매장");
  await expect(main(page)).toContainText("결제 금액7,200원");
  await page.getByRole("button", { name: "주문 확인" }).click();

  await expect(page.getByText("8 / 9")).toBeVisible();
  await expect(main(page)).toContainText("카드를 아래쪽 리더기에 넣어 주세요");
  await page.getByRole("button", { name: "신용·체크카드" }).click();
  await expect(page.getByText("결제 · 신용·체크카드")).toBeVisible();
  await page.getByRole("button", { name: "결제 완료 확인" }).click();

  await expect(page.getByText("9 / 9")).toBeVisible();
  // 미션은 첫 화면 뒤에도 결제 완료(9/9)까지 진행바 아래에 계속 보인다
  await expect(page.getByText("미션: 불고기버거 세트 · 매장 · 카드")).toBeVisible();
  await expect(page.getByRole("heading", { name: "결제가 완료되었어요" })).toBeVisible();
  const receipt = page.getByRole("region", { name: "영수증" });
  await expect(receipt).toContainText("디우미 패스트푸드 · 매장");
  await expect(receipt).toContainText("주문번호 A-127");
  await expect(receipt.getByRole("listitem")).toHaveText(["불고기버거 세트17,200"]);
  await page.getByRole("button", { name: "결과 보기" }).click();

  await expect(page.getByRole("heading", { name: "미션을 성공했어요!" })).toBeVisible();
  await expect(page.getByText(/^미션:/)).toHaveCount(0);
  await expect(page.getByRole("progressbar", { name: "미션 수행 결과" })).toHaveAttribute(
    "aria-valuenow",
    "100",
  );
  await expect(page.getByRole("region", { name: "잘한 점" }).getByRole("listitem")).toHaveText([
    "매장 식사를 골랐어요",
    "불고기버거 세트를 골랐어요",
    "감자튀김 · 콜라를 골랐어요",
    "카드로 결제했어요",
  ]);
  await expect(page.getByRole("region", { name: "완료한 주문" })).toHaveCount(0);

  // 백엔드에 보낸 행동: 주문 확인에서 items를 함께 보낸다
  expect(backend.actions.find((action) => action.target_code === "BUTTON_ORDER")).toMatchObject({
    step_id: 27,
    action_data: {
      items: [
        {
          menu: "MENU_BULGOGI_BURGER",
          meal_type: "MEAL_SET",
          side: "SIDE_FRIES",
          drink: "DRINK_COLA",
          quantity: 1,
        },
      ],
    },
  });
});

test("사이드·음료와 결제 방법이 다르면 주문은 완료되고 서버 판정의 다른 점을 보여 준다", async ({
  page,
}) => {
  await mockBackend(page, {
    isSuccess: false,
    conditions: [
      { condition: FASTFOOD_CONDITIONS[0], passed: true },
      { condition: FASTFOOD_CONDITIONS[1], passed: true },
      {
        condition: FASTFOOD_CONDITIONS[2],
        passed: false,
        detail: "SIDE_SALAD · 제로콜라를 골랐어요",
      },
      { condition: FASTFOOD_CONDITIONS[3], passed: false, detail: "모바일페이를 골랐어요" },
    ],
  });
  await startMission(page);
  await addBulgogiSet(page, "샐러드 +500원", "제로콜라 +0원");
  await payWith(page, "모바일페이");
  await page.getByRole("button", { name: "결과 보기" }).click();

  await expect(page.getByRole("heading", { name: "주문은 완료됐어요" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "미션 수행 결과" })).toHaveAttribute(
    "aria-valuenow",
    "50",
  );
  const differences = page.getByRole("region", { name: "미션과 다른 점" });
  await expect(differences).toContainText(
    "샐러드 · 제로콜라를 골랐어요 (미션: 감자튀김 · 콜라 선택)",
  );
  await expect(differences).toContainText("모바일페이를 골랐어요 (미션: 카드 결제 완료)");
});

test("단품을 고르면 사이드·음료 없이 담기 화면으로 가고, 판정에서 알려 준다", async ({ page }) => {
  await mockBackend(page, {
    isSuccess: false,
    conditions: [
      { condition: FASTFOOD_CONDITIONS[0], passed: true },
      { condition: FASTFOOD_CONDITIONS[1], passed: false, detail: "단품을 골랐어요" },
      { condition: FASTFOOD_CONDITIONS[2], passed: false, detail: "사이드·음료를 고르지 않았어요" },
      { condition: FASTFOOD_CONDITIONS[3], passed: true },
    ],
  });
  await startMission(page);
  await page.getByRole("button", { name: "매장에서 먹기" }).click();
  await page.getByRole("button", { name: "불고기버거 4,800원" }).click();
  await page.getByRole("button", { name: /^단품/ }).click();
  await expect(page.getByText("5 / 9")).toBeVisible();
  await expect(main(page)).toContainText("구성버거만");
  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await payWith(page, "신용·체크카드");
  await page.getByRole("button", { name: "결과 보기" }).click();

  const differences = page.getByRole("region", { name: "미션과 다른 점" });
  await expect(differences).toContainText("단품을 골랐어요 (미션: 불고기버거 세트 선택)");
  await expect(differences).toContainText("사이드·음료를 고르지 않았어요");
});

test("사이드·음료를 다 고르지 않고 선택 완료를 누르면 알려 준다", async ({ page }) => {
  await startMission(page);
  await page.getByRole("button", { name: "매장에서 먹기" }).click();
  await page.getByRole("button", { name: "불고기버거 4,800원" }).click();
  await page.getByRole("button", { name: /^세트/ }).click();
  await page.getByRole("button", { name: "감자튀김 기본" }).click();
  await page.getByRole("button", { name: "선택 완료" }).click();

  await expect(page.getByTestId("app-shell").getByRole("alert")).toContainText(
    "음료를 골라 주세요",
  );
  await expect(page.getByText("4 / 9")).toBeVisible();
});

test("담기 화면에서 사이드를 누르면 구성 화면으로 돌아가고, 수량을 바꾸면 금액이 바뀐다", async ({
  page,
}) => {
  await startMission(page);
  await page.getByRole("button", { name: "매장에서 먹기" }).click();
  await page.getByRole("button", { name: "불고기버거 4,800원" }).click();
  await page.getByRole("button", { name: /^세트/ }).click();
  await page.getByRole("button", { name: "감자튀김 기본" }).click();
  await page.getByRole("button", { name: "콜라 기본" }).click();
  await page.getByRole("button", { name: "선택 완료" }).click();

  await page.getByRole("button", { name: "사이드 감자튀김 바꾸기" }).click();
  await expect(page.getByText("4 / 9")).toBeVisible();
  await page.getByRole("button", { name: "선택 완료" }).click();

  await page.getByRole("button", { name: "수량 더하기" }).click();
  await expect(main(page)).toContainText("금액14,400원");
});

test("주문 확인에서 메뉴 추가하기를 누르면 메뉴판으로 돌아가고, 수량도 바꿀 수 있다", async ({
  page,
}) => {
  await startMission(page);
  await addBulgogiSet(page);
  await page.getByRole("button", { name: "주문 내역 확인 후 결제하기" }).click();

  await page.getByRole("button", { name: "불고기버거 세트 수량 더하기" }).click();
  await expect(main(page)).toContainText("결제 금액14,400원");

  await page.getByRole("button", { name: "메뉴 추가하기" }).click();
  await expect(page.getByRole("heading", { name: "메뉴를 더 골라 보세요" })).toBeVisible();
  await expect(main(page)).toContainText("불고기버거 세트 × 2");
});

test("결제 방법에서 쿠폰·포인트는 준비 중이라고 알려 준다", async ({ page }) => {
  await startMission(page);
  await addBulgogiSet(page);
  await page.getByRole("button", { name: "주문 내역 확인 후 결제하기" }).click();
  await page.getByRole("button", { name: "주문 확인" }).click();

  await page.getByRole("button", { name: "쿠폰·포인트" }).click();
  const dialog = page.getByRole("dialog", { name: "준비 중이에요" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "확인" }).click();
  await expect(page.getByText("8 / 9")).toBeVisible();
});

test("미션 확인 화면에는 음성 도우미가 없고, 미션을 시작하면 생긴다", async ({ page }) => {
  await page.goto("/fastfood/real/mission");
  await expect(page.getByRole("heading", { name: "오늘의 미션" })).toBeVisible();
  await expect(page.getByRole("button", { name: "음성 도우미" })).toHaveCount(0);

  await page.getByRole("button", { name: "미션 시작하기" }).click();
  await page.getByRole("button", { name: "음성 도우미" }).click();
  const sheet = page.getByRole("dialog", { name: "AI 음성 도우미" });
  // e2e는 백엔드에 연결되지 않으므로 연결 실패 안내가 나온다
  await expect(sheet.getByRole("alert")).toContainText("지금은 AI 도우미에 연결할 수 없어요");
});
