import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: "http://localhost:3100" },
  projects: [
    {
      name: "mobile",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        hasTouch: true,
      },
    },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    /* e2e가 실제 백엔드 DB에 방문자·세션을 쌓지 않게 연결되지 않는 주소를 쓴다. API 실패는 화면이 삼킨다 */
    env: { DIUMI_API_BASE_URL: "http://127.0.0.1:9/api/v1" },
    timeout: 180_000,
  },
});
