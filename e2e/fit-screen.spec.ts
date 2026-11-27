import { expect, test, type Page } from "@playwright/test";
import { startMission, target } from "./practice-helpers";

/**
 * 휴대폰 브라우저에서 보이는 높이(아이폰 15 사파리, 주소창·툴바 제외)에서
 * - 들어가는 화면들은 스크롤 없이 한 화면에 보이고
 * - 연습 중에는 눌러야 할 곳이 항상 화면 안에 보이는지 확인한다.
 */
const PHONE = { width: 393, height: 659 };

/** 아이폰 SE 사파리. 이 크기에서는 넘쳐도 되지만 눌러야 할 곳은 보여야 한다 */
const SMALL_PHONE = { width: 375, height: 553 };

/**
 * 아이폰 15에서도 조금 넘쳐도 되는 연습 화면 (단계 번호는 0부터). 눌러야 할 곳은 자동 스크롤로 보여 준다.
 * - basic:2, options:7, options:11 = 안내가 두 줄인 카페 옵션 화면 (PC04, PA09, PA13)
 * - options:9, options:10 = 카페 유료 옵션 화면 (PA11, PA12)
 * - options:12 = 두 메뉴가 담긴 카페 결제하기 화면 (PA14)
 * - fastfood basic:4 = 안내가 세 줄인 패스트푸드 결제하기 화면 (PE06)
 * - fastfood set:10 = 버거 두 개가 담긴 패스트푸드 결제하기 화면 (PB12)
 */
const ALLOWED_TO_SCROLL = new Set([
  "cafe/practice/basic:2",
  "cafe/practice/options:7",
  "cafe/practice/options:9",
  "cafe/practice/options:10",
  "cafe/practice/options:11",
  "cafe/practice/options:12",
  "fastfood/practice/basic:4",
  "fastfood/practice/set:10",
]);

test.use({ viewport: PHONE });
test.beforeEach(() => {
  test.skip(test.info().project.name !== "mobile", "휴대폰 크기 확인은 한 번만 한다");
});

async function overflow(page: Page) {
  return page.evaluate(() => {
    const doc = document.documentElement.scrollHeight - innerHeight;
    const main = document.querySelector("main");
    return Math.max(doc, main ? main.scrollHeight - main.clientHeight : 0);
  });
}

async function expectTargetInView(page: Page) {
  const box = (await target(page).boundingBox())!;
  const height = page.viewportSize()!.height;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(height);
}

for (const route of [
  "/",
  "/cafe",
  "/cafe/real",
  "/cafe/practice",
  "/fastfood/real",
  "/fastfood",
  "/fastfood/practice",
]) {
  test(`${route}은 휴대폰에서 스크롤 없이 한 화면에 보인다`, async ({ page }) => {
    await page.goto(route);
    await expect.poll(() => overflow(page)).toBe(0);
  });
}

for (const mission of [
  "cafe/practice/basic",
  "cafe/practice/options",
  "cafe/practice/coupon",
  "fastfood/practice/basic",
  "fastfood/practice/set",
  "fastfood/practice/coupon",
]) {
  test(`${mission} 미션은 휴대폰에서 눌러야 할 곳이 항상 화면 안에 보인다`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await startMission(page, `/${mission}`);

    for (let step = 0; (await target(page).count()) > 0; step++) {
      await expectTargetInView(page);
      if (!ALLOWED_TO_SCROLL.has(`${mission}:${step}`)) {
        expect(await overflow(page), `${mission} ${step}번째 화면이 넘친다`).toBe(0);
      }
      await target(page).click();
    }
    await expect(page.getByRole("heading", { name: "연습을 마쳤어요!" })).toBeVisible();
    expect(await overflow(page)).toBe(0);
  });

  test(`${mission} 미션은 아이폰 SE에서도 눌러야 할 곳이 항상 화면 안에 보인다`, async ({
    page,
  }) => {
    await page.setViewportSize(SMALL_PHONE);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await startMission(page, `/${mission}`);

    while ((await target(page).count()) > 0) {
      await expectTargetInView(page);
      await target(page).click();
    }
  });

  test(`${mission} 미션에서 잘못 누르면 빨간 안내와 눌러야 할 곳이 함께 보인다`, async ({
    page,
  }) => {
    await page.setViewportSize(SMALL_PHONE);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await startMission(page, `/${mission}`);

    const dimmed = page.locator("main button[aria-disabled]").first();
    await dimmed.click({ force: true });
    await expect(page.getByTestId("app-shell").getByRole("alert")).toBeInViewport();
    await expectTargetInView(page);
  });
}

test("헤더와 처음으로·이전으로는 본문을 스크롤해도 화면 위에 남는다", async ({ page }) => {
  await page.setViewportSize(SMALL_PHONE);
  await startMission(page, "/cafe/practice/options");
  await page.locator("main").evaluate((main) => main.scrollTo({ top: main.scrollHeight }));

  const back = (await page.getByRole("button", { name: "이전으로" }).boundingBox())!;
  expect(back.y).toBeGreaterThanOrEqual(0);
  expect(back.y).toBeLessThan(150);
});

test("버튼을 누르는 동안 살짝 작아지고, 기본 회색 터치 표시는 꺼져 있다", async ({ page }) => {
  await page.goto("/cafe");
  const card = page.getByRole("link", { name: "연습모드 시작하기" });
  const box = (await card.boundingBox())!;

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(card).toHaveCSS("transform", "matrix(0.97, 0, 0, 0.97, 0, 0)");
  await page.mouse.up();

  const highlight = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("-webkit-tap-highlight-color"),
  );
  expect(highlight).toBe("rgba(0, 0, 0, 0)");
});

test("실전 미션은 휴대폰에서 화면마다 다음으로 가는 버튼이 늘 보인다", async ({ page }) => {
  const expectInView = async (name: string | RegExp) => {
    const box = (await page
      .getByRole("button", { name, exact: typeof name === "string" })
      .boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(PHONE.height);
  };

  await page.goto("/cafe/real/mission");
  await expectInView("미션 시작하기");
  await page.getByRole("button", { name: "미션 시작하기" }).click();
  await page.getByRole("button", { name: "포장해서 갈래요" }).click();
  await expectInView("선택한 메뉴 보기");
  await page.getByRole("button", { name: "아메리카노 3,200원" }).click();
  await expectInView("선택 완료");
  await page.getByRole("button", { name: /유료 옵션/ }).click();
  await expectInView("유료 옵션 선택 완료");
  await page.getByRole("button", { name: "유료 옵션 선택 완료" }).click();
  await page.getByRole("button", { name: /무료 옵션/ }).click();
  await expectInView("무료 옵션 선택 완료");
  await page.getByRole("button", { name: "무료 옵션 선택 완료" }).click();
  await page.getByRole("button", { name: "ICE" }).click();
  await page.getByRole("button", { name: "선택 완료" }).click();
  await expectInView("결제하기");
  await page.getByRole("button", { name: "결제하기" }).click();
  await expectInView("다음");
  await page.getByRole("button", { name: "다음" }).click();
  await expectInView("다음");
  await page.getByRole("button", { name: "다음" }).click();
  await page.getByRole("button", { name: "신용·체크카드" }).click();
  await expectInView("결제 완료 확인");
  await page.getByRole("button", { name: "결제 완료 확인" }).click();
  await expectInView("결과 보기");
  await page.getByRole("button", { name: "결과 보기" }).click();
  await expectInView("다시 도전하기");

  await page.goto("/fastfood/real/mission");
  await page.getByRole("button", { name: "미션 시작하기" }).click();
  await page.getByRole("button", { name: "매장에서 먹기" }).click();
  await expectInView("선택한 메뉴 보기");
  await page.getByRole("button", { name: "불고기버거 4,800원" }).click();
  await page.getByRole("button", { name: /^세트/ }).click();
  await expectInView("선택 완료");
  await page.getByRole("button", { name: "감자튀김 기본" }).click();
  await page.getByRole("button", { name: "콜라 기본" }).click();
  await page.getByRole("button", { name: "선택 완료" }).click();
  await expectInView("장바구니 담기");
  await page.getByRole("button", { name: "장바구니 담기" }).click();
  await expectInView("주문 내역 확인 후 결제하기");
  await page.getByRole("button", { name: "주문 내역 확인 후 결제하기" }).click();
  await expectInView(/^주문 확인/);
  await page.getByRole("button", { name: /^주문 확인/ }).click();
  await expectInView("기프트카드");
  await page.getByRole("button", { name: "신용·체크카드" }).click();
  await page.getByRole("button", { name: "결제 완료 확인" }).click();
  await expectInView("결과 보기");
  await page.getByRole("button", { name: "결과 보기" }).click();
  await expectInView("다시 도전하기");
});
