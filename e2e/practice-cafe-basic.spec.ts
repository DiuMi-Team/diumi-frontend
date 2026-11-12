import { expect, test, type Page } from "@playwright/test";

/** 카페 기본 미션(PC01~PC12)에서 차례로 누를 곳과 그 화면의 안내 문구 */
const WALKTHROUGH = [
  { guide: "포장해서 갈래요를 눌러 보세요", press: "포장해서 갈래요" },
  { guide: "아메리카노를 눌러 보세요", press: "아메리카노 3,200원" },
  { guide: "따뜻하게(HOT)를 눌러 보세요", press: "따뜻하게 HOT" },
  { guide: "선택 완료를 눌러 보세요", press: "선택 완료 · 3,200원" },
  { guide: "결제하기를 눌러 보세요", press: "결제하기" },
  { guide: "주문 내역을 확인하고 다음을 눌러 보세요", press: "다음" },
  { guide: "적립·쿠폰 없이 진행을 눌러 보세요", press: "적립·쿠폰 없이 진행" },
  { guide: "신용·체크카드를 눌러 보세요", press: "신용·체크카드" },
  { guide: "카드를 넣었어요를 눌러 보세요", press: "카드를 넣었어요" },
  { guide: "대기번호를 확인하고 확인을 눌러 보세요", press: "확인" },
];

function target(page: Page) {
  return page.locator("[data-practice-target]");
}

/**
 * 흐린 칸은 aria-disabled라 Playwright가 누를 수 없는 것으로 보고 기다린다.
 * 실제 사용자는 누를 수 있고 그때 빨간 안내가 떠야 하므로 force로 누른다.
 */
async function pressDimmed(page: Page, name: string) {
  await page.getByRole("button", { name }).click({ force: true });
}

async function startMission(page: Page) {
  await page.goto("/cafe/practice/basic");
  await expect(page.getByRole("heading", { name: "오늘의 미션" })).toBeVisible();
  await page.getByRole("button", { name: "연습 시작하기" }).click();
}

test("모드 선택에서 연습모드 → 미션 선택 → 카페 기본 미션으로 들어간다", async ({ page }) => {
  await page.goto("/cafe");
  await page.getByRole("link", { name: "연습모드 시작하기" }).click();
  await expect(page).toHaveURL("/cafe/practice");
  await expect(page.getByRole("heading", { name: "어떤 연습을 해볼까요?" })).toBeVisible();

  await page.getByRole("link", { name: /아메리카노 1잔 담기/ }).click();
  await expect(page).toHaveURL("/cafe/practice/basic");
  await expect(page.getByText("카드로 결제하기")).toBeVisible();

  await page.getByRole("link", { name: "이전으로" }).click();
  await expect(page).toHaveURL("/cafe/practice");
});

test("아직 만들지 않은 미션은 준비 중 안내를 띄운다", async ({ page }) => {
  await page.goto("/cafe/practice");
  for (const name of [/카페모카 1잔 담기/, /쿠폰 쓰고 결제하기/]) {
    await page.getByRole("button", { name }).click();
    const dialog = page.getByRole("dialog", { name: "준비 중이에요" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "확인" }).click();
    await expect(dialog).toBeHidden();
  }
});

test("안내를 따라 처음부터 끝까지 완주하고 3,200원을 결제한다", async ({ page }) => {
  await startMission(page);

  for (const [index, { guide, press }] of WALKTHROUGH.entries()) {
    await expect(page.getByText(guide)).toBeVisible();
    await expect(target(page)).toHaveCount(1);
    await expect(target(page)).toHaveAccessibleName(press);

    if (index === 5) {
      await expect(page.getByRole("list", { name: "주문 내역" })).toContainText(
        "HOT · Regular · 포장",
      );
      await expect(page.getByText("결제 금액")).toBeVisible();
      await expect(page.locator("main")).toContainText("3,200원");
    }
    if (index === 9) await expect(page.getByText("134")).toBeVisible();

    await target(page).click();
  }

  await expect(page.getByRole("heading", { name: "연습을 마쳤어요!" })).toBeVisible();
  await expect(page.getByRole("list", { name: "연습한 내용" })).toContainText("카드 결제 3,200원");

  await page.getByRole("link", { name: "한 번 더 연습" }).click();
  await expect(page).toHaveURL("/cafe/practice");
});

test("눌러야 할 곳만 강조하고 나머지는 흐리게 보인다", async ({ page }) => {
  // 강조 테두리는 1.5초마다 깜빡이므로, 움직임 줄이기 설정에서 멈춘 상태의 색을 확인한다
  await page.emulateMedia({ reducedMotion: "reduce" });
  await startMission(page);

  const highlighted = target(page);
  await expect(highlighted).toHaveCSS("outline-style", "solid");
  await expect(highlighted).toHaveCSS("outline-color", "rgb(245, 166, 91)");
  await expect(highlighted).toHaveCSS("outline-width", "4px");

  const dimmed = page.getByRole("button", { name: "매장에서 먹어요" });
  await expect(dimmed).toHaveAttribute("aria-disabled", "true");
  await expect(dimmed).toHaveCSS("opacity", "0.45");
});

test("강조 테두리는 1.5초 간격으로 깜빡인다", async ({ page }) => {
  await startMission(page);
  await expect(target(page)).toHaveCSS("animation-duration", "1.5s");
  await expect(target(page)).toHaveCSS("animation-iteration-count", "infinite");
});

test("다른 곳을 누르면 빨간 안내가 뜨고 선택은 바뀌지 않는다", async ({ page }) => {
  await startMission(page);

  await pressDimmed(page, "매장에서 먹어요");
  const alert = page.getByTestId("app-shell").getByRole("alert");
  await expect(alert).toContainText(
    "다른 곳을 눌렀어요. 주황 테두리의 포장해서 갈래요를 눌러 보세요",
  );
  await expect(alert).toContainText("선택은 바뀌지 않았어요");
  await expect(page.getByText("1단계 / 총 3단계")).toBeVisible();

  await target(page).click();
  await expect(alert).toHaveCount(0);
  await expect(page.getByText("아메리카노를 눌러 보세요")).toBeVisible();
});

test("이전으로는 한 단계 전으로 돌아가고 그 단계의 선택도 되돌린다", async ({ page }) => {
  await startMission(page);
  for (const { press } of WALKTHROUGH.slice(0, 4)) {
    await page.getByRole("button", { name: press, exact: true }).click();
  }
  await expect(page.getByText("아메리카노 HOT · Regular × 1")).toBeVisible();

  await page.getByRole("button", { name: "이전으로" }).click();
  await expect(page.getByText("선택 완료를 눌러 보세요")).toBeVisible();

  await page.getByRole("button", { name: "이전으로" }).click();
  await expect(page.getByText("따뜻하게(HOT)를 눌러 보세요")).toBeVisible();
  await expect(page.getByRole("button", { name: "따뜻하게 HOT" })).not.toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test("처음으로를 누르면 확인 창이 뜨고, 계속하거나 홈으로 갈 수 있다", async ({ page }) => {
  await startMission(page);
  await page.getByRole("button", { name: "처음으로" }).click();

  const dialog = page.getByRole("dialog", { name: "연습을 그만할까요?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "계속 연습하기" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("포장해서 갈래요를 눌러 보세요")).toBeVisible();

  await page.getByRole("button", { name: "처음으로" }).click();
  await dialog.getByRole("button", { name: "처음으로 가기" }).click();
  await expect(page).toHaveURL("/");
});

test("모든 단계에서 글자는 16px 이상, 터치 영역은 48px 이상이고 가로로 넘치지 않는다", async ({
  page,
}) => {
  await startMission(page);

  for (const { guide } of WALKTHROUGH) {
    await expect(page.getByText(guide)).toBeVisible();
    const problems = await page.evaluate(() => {
      const smallText = [...document.querySelectorAll("main *")]
        .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim()))
        .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
        .map((el) => el.textContent);
      const smallTargets = [...document.querySelectorAll("main a, main button")]
        .filter((el) => {
          const rect = el.getBoundingClientRect();
          const hitArea = parseFloat(getComputedStyle(el, "::after").height) || 0;
          return Math.max(rect.height, hitArea) < 48;
        })
        .map((el) => el.getAttribute("aria-label") ?? el.textContent);
      const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth;
      return { smallText, smallTargets, overflow };
    });
    expect(problems).toEqual({ smallText: [], smallTargets: [], overflow: false });
    await target(page).click();
  }
});
