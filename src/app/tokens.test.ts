import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(join(__dirname, "globals.css"), "utf8");

describe("디자인 토큰", () => {
  it.each([
    ["primary", "#55a4e3"],
    ["mint-light", "#b9e6e8"],
    ["mint", "#5ac7c3"],
    ["orange", "#f5a65b"],
    ["white", "#fdfdfd"],
    ["gray-1", "#eff4f4"],
    ["gray-2", "#dfebec"],
    ["text", "#3d3531"],
    ["text-sub", "#788086"],
    ["error", "#e5484d"],
    ["error-bg", "#fde4e4"],
    ["error-text", "#d93036"],
  ])("%s는 %s이다", (name, value) => {
    expect(css).toContain(`--color-${name}: ${value};`);
  });

  it("16px 미만 글자 크기를 정의하지 않는다", () => {
    const sizes = [...css.matchAll(/--text-\d+: (\d+)px;/g)].map((m) => Number(m[1]));
    expect(sizes.length).toBeGreaterThan(0);
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(16);
  });
});
