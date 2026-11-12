import { expect, test, type Page } from "@playwright/test";
import {
  expectSeniorFriendly,
  practiceAlert,
  pressDimmed,
  startMission,
  target,
} from "./practice-helpers";

/** 카페 옵션 포함 미션(PA01~PA20)의 각 화면 안내 문구. 순서대로 눌러야 할 곳을 누르면 다음 화면이 된다 */
const GUIDES = [
  "포장해서 갈래요를 눌러 보세요",
  "아메리카노를 눌러 보세요",
  "차갑게(ICE)를 눌러 보세요",
  "Large를 눌러 보세요",
  "＋를 한 번 눌러 2잔으로 만들어 보세요",
  "선택 완료를 눌러 보세요",
  "이번엔 카페모카를 눌러 보세요",
  "따뜻하게(HOT)를 눌러 보세요",
  "유료 옵션의 추가를 눌러 보세요",
  "휘핑크림의 ＋를 한 번 눌러 보세요",
  "유료 옵션 선택 완료를 눌러 보세요",
  "선택 완료를 눌러 보세요",
  "결제하기를 눌러 보세요",
  "주문 내역을 확인하고 다음을 눌러 보세요",
  "적립·쿠폰 없이 진행을 눌러 보세요",
  "신용·체크카드를 눌러 보세요",
  "카드를 넣었어요를 눌러 보세요",
  "대기번호를 확인하고 확인을 눌러 보세요",
];

const guideBubble = (page: Page, text: string) =>
  page.locator("main").getByText(text, { exact: true });

async function startOptions(page: Page) {
  await startMission(page, "/cafe/practice/options");
}

/** 안내를 따라 from번째 화면에서 index번째 화면(0부터)까지 간다 */
async function goToStep(page: Page, index: number, from = 0) {
  for (const guide of GUIDES.slice(from, index)) {
    await expect(guideBubble(page, guide)).toBeVisible();
    await target(page).click();
  }
  await expect(guideBubble(page, GUIDES[index])).toBeVisible();
}

test("미션 선택에서 옵션 포함 미션으로 들어간다", async ({ page }) => {
  await page.goto("/cafe/practice");
  await page.getByRole("link", { name: /카페모카 1잔 담기/ }).click();
  await expect(page).toHaveURL("/cafe/practice/options");
  await expect(page.getByText("차갑게(ICE) · Large 사이즈")).toBeVisible();
  await expect(page.getByText("따뜻하게(HOT) · Regular · 휘핑크림 추가")).toBeVisible();
});

test("안내를 따라 아메리카노 2잔, 카페모카 1잔을 담고 12,700원을 결제한다", async ({ page }) => {
  await startOptions(page);

  await goToStep(page, 5);
  await expect(page.getByRole("button", { name: "선택 완료 · 7,400원" })).toBeVisible();

  await goToStep(page, 6, 5);
  await expect(page.getByRole("heading", { name: "메뉴를 더 담아 보세요" })).toBeVisible();
  await expect(page.getByText("아메리카노 ICE · Large × 2")).toBeVisible();
  await expect(page.getByRole("button", { name: "결제하기" })).toHaveCount(0);

  await goToStep(page, 11, 6);
  await expect(page.getByText("휘핑크림 1", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "선택 완료 · 5,300원" })).toBeVisible();

  await goToStep(page, 12, 11);
  await expect(page.getByText("카페모카 HOT · Regular · 휘핑 × 1")).toBeVisible();
  await expect(page.locator("main")).toContainText("12,700원");

  await goToStep(page, 13, 12);
  await expect(page.getByRole("list", { name: "주문 내역" })).toContainText(
    "HOT · Regular · 휘핑크림 · 포장",
  );

  await goToStep(page, 17, 13);
  await expect(page.getByText("133")).toBeVisible();
  await target(page).click();

  await expect(page.getByRole("heading", { name: "연습을 마쳤어요!" })).toBeVisible();
  const summary = page.getByRole("list", { name: "연습한 내용" });
  await expect(summary).toContainText("카페모카 HOT · Regular · 휘핑크림 1잔");
  await expect(summary).toContainText("카드 결제 12,700원");
});

test("유료 옵션 화면에서 휘핑크림을 더하면 추가 금액과 음료 포함 금액이 바뀐다", async ({
  page,
}) => {
  await startOptions(page);
  await goToStep(page, 9);
  await expect(page.getByRole("group", { name: "휘핑크림 0개" })).toBeVisible();

  await target(page).click();
  await expect(page.getByRole("group", { name: "휘핑크림 1개" })).toBeVisible();
  await expect(page.locator("main")).toContainText("추가 금액500원");
  await expect(page.locator("main")).toContainText("음료 포함 금액5,300원");
});

test("다른 곳을 누르면 눌러야 할 곳을 알려 준다 (PX1)", async ({ page }) => {
  await startOptions(page);
  await goToStep(page, 3);

  await pressDimmed(page, /^Regular/);
  await expect(practiceAlert(page)).toContainText(
    "다른 곳을 눌렀어요. 주황 테두리의 Large를 눌러 보세요",
  );
  await expect(practiceAlert(page)).toContainText("선택은 바뀌지 않았어요");
});

test("수량을 미션과 다르게 줄이면 바로잡도록 안내하고, 바로잡으면 이어서 한다 (PX2)", async ({
  page,
}) => {
  await startOptions(page);
  await goToStep(page, 5);

  const decrease = page.getByRole("button", { name: "수량 줄이기" });
  await expect(decrease).not.toHaveAttribute("aria-disabled");
  await decrease.click();

  await expect(practiceAlert(page)).toContainText("미션은 2잔이에요. ＋를 한 번 더 눌러 보세요");
  await expect(practiceAlert(page)).toContainText("지금은 1잔이 선택되어 있어요");
  await expect(page.getByLabel("수량 1잔")).toBeVisible();
  await expect(target(page)).toHaveAccessibleName("수량 늘리기");

  await target(page).click();
  await expect(practiceAlert(page)).toHaveCount(0);
  await expect(guideBubble(page, "선택 완료를 눌러 보세요")).toBeVisible();
  await expect(page.getByLabel("수량 2잔")).toBeVisible();
  await expect(page.getByRole("button", { name: "선택 완료 · 7,400원" })).toBeVisible();
});

test("모든 단계에서 글자는 16px 이상, 터치 영역은 48px 이상이고 가로로 넘치지 않는다", async ({
  page,
}) => {
  await startOptions(page);
  for (const guide of GUIDES) {
    await expect(guideBubble(page, guide)).toBeVisible();
    await expectSeniorFriendly(page);
    await target(page).click();
  }
});
