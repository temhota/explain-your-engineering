import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: { baseURL: "http://127.0.0.1:4100", trace: "retain-on-failure" },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--use-fake-ui-for-media-stream",
            "--use-fake-device-for-media-stream",
          ],
        },
      },
    },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: [
    {
      command: "npm run start -- --port 4100",
      url: "http://127.0.0.1:4100",
      reuseExistingServer: false,
      env: { AI_ENABLED: "true", OPENAI_API_KEY: "" },
      timeout: 60000,
    },
    {
      command: "npm run start -- --port 4103",
      url: "http://127.0.0.1:4103",
      reuseExistingServer: false,
      env: { AI_ENABLED: "false", OPENAI_API_KEY: "" },
      timeout: 60000,
    },
  ],
});
