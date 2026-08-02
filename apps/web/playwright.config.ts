import { defineConfig, devices } from "@playwright/test";

const webPort = process.env.PLAYWRIGHT_WEB_PORT ?? "5174";
const apiPort = process.env.PLAYWRIGHT_API_PORT ?? "4175";
const webUrl = `http://127.0.0.1:${webPort}`;
const apiUrl = `http://127.0.0.1:${apiPort}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  workers: 1,
  webServer: [
    {
      command: `PORT=${apiPort} CORS_ORIGIN=${webUrl} pnpm --dir ../.. --filter @whyspend/api dev`,
      url: `${apiUrl}/health`,
      reuseExistingServer: true
    },
    {
      command: `VITE_API_BASE_URL=${apiUrl}/api pnpm dev -- --port ${webPort}`,
      url: webUrl,
      reuseExistingServer: true
    }
  ],
  use: {
    baseURL: webUrl,
    trace: "on-first-retry"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ]
});
