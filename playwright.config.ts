import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env["E2E_PORT"] ?? 8080);
const BASE_URL = process.env["E2E_BASE_URL"] ?? `http://localhost:${PORT}`;

/**
 * E2E + visual regression configuration.
 * On failure Playwright keeps a trace, a screenshot and a video so a11y/focus
 * regressions can be replayed without reproducing them by hand.
 */
export default defineConfig({
  testDir: "./e2e",
  snapshotDir: "./e2e/__screenshots__",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: "disabled", caret: "hide" },
  },
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    viewport: { width: 420, height: 900 },
    locale: "id-ID",
    timezoneId: "Asia/Jakarta",
    reducedMotion: "reduce",
  },
  projects: [{ name: "mobile-chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env["E2E_BASE_URL"]
    ? undefined
    : {
        command: "bun run dev",
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
