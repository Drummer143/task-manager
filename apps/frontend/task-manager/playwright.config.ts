import { defineConfig, devices } from "@playwright/test";

const storageStatePath = "apps/frontend/task-manager/e2e/.auth/storage-state.json";

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? "github" : "html",
	globalSetup: "./e2e/global-setup.ts",
	globalTeardown: "./e2e/global-teardown.ts",
	use: {
		baseURL: "http://localhost:1346",
		storageState: storageStatePath,
		trace: "on-first-retry",
		testIdAttribute: "data-test-id"
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] }
		}
	],
	webServer: {
		command: "pnpm exec nx run task-manager:dev",
		url: "http://localhost:1346",
		reuseExistingServer: !process.env.CI,
		cwd: "../../.."
	}
});
