import { defineConfig, devices } from "@playwright/test";

const webPort = process.env.PLAYWRIGHT_WEB_PORT ?? "5174";
const apiPort = process.env.PLAYWRIGHT_API_PORT ?? "4175";
const webUrl = `http://127.0.0.1:${webPort}`;
const apiUrl = `http://127.0.0.1:${apiPort}`;
const fixtureOnly = process.env.PLAYWRIGHT_FIXTURE_ONLY === "1";

const strictPort = process.env.PLAYWRIGHT_STRICT_PORT === "1";
const apiServer = {
  command: `PORT=${apiPort} CORS_ORIGIN=${webUrl} pnpm --dir ../.. --filter @whyspend/api dev`,
  url: `${apiUrl}/health`,
  reuseExistingServer: !strictPort
};

const webServer = {
  command: `${fixtureOnly ? "" : `VITE_API_BASE_URL=${apiUrl}/api `}pnpm exec vite --host 127.0.0.1 --port ${webPort} --strictPort`,
  url: webUrl,
  reuseExistingServer: !strictPort
};

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  workers: 1,
  webServer: fixtureOnly ? [webServer] : [apiServer, webServer],
  use: {
    baseURL: webUrl,
    serviceWorkers: "block",
    trace: "on-first-retry"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ]
});
