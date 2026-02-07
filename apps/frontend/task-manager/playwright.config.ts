import { workspaceRoot } from "@nx/devkit";
import { nxE2EPreset } from "@nx/playwright/preset";
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env["BASE_URL"] || "http://localhost:1346";
const isCI = !!process.env["CI"];

export default defineConfig({
	...nxE2EPreset(__filename, { testDir: "./e2e" }),
	use: {
		baseURL,
		trace: "on-first-retry"
	},
	webServer: isCI
		? undefined
		: {
				command: "pnpm nx dev task-manager",
				url: baseURL,
				reuseExistingServer: true,
				cwd: workspaceRoot,
				timeout: 120000
			},
	projects: [
		{
			name: "setup",
			testMatch: /.*\.setup\.ts/
		},
		{
			name: "chromium",
			use: {
				...devices["Desktop Chrome"],
				storageState: ".auth/state.json"
			},
			dependencies: ["setup"]
		},
		{
			name: "firefox",
			use: {
				...devices["Desktop Firefox"],
				storageState: ".auth/state.json"
			},
			dependencies: ["setup"]
		},
		{
			name: "webkit",
			use: {
				...devices["Desktop Safari"],
				storageState: ".auth/state.json"
			},
			dependencies: ["setup"]
		}
	]
});
