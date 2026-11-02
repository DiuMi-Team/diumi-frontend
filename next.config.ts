import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

export default function config(phase: string): NextConfig {
  return {
    /* page.dev.tsx는 개발 서버에서만 라우트가 된다 */
    pageExtensions: phase === PHASE_DEVELOPMENT_SERVER ? ["dev.tsx", "tsx", "ts"] : ["tsx", "ts"],
    cacheComponents: true,
    partialPrefetching: true,
    turbopack: {
      rules: {
        "*.css": {
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
      },
    },
  };
}
