import { defineConfig, devices } from "@playwright/test";

/**
 * E2E config (spec §13). Runs the dev server and drives Chromium through the
 * 834 happy path, asserting — among other things — that no file bytes are
 * uploaded. Unit tests live in /tests (Vitest); E2E lives in /e2e.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
