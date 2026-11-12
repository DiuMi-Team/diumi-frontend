import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    /* tsconfig의 "@/*" 경로를 테스트에서도 쓴다 */
    tsconfigPaths: true,
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
