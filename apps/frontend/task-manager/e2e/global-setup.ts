import dotenv from "dotenv";
import fs from "fs";
import path from "path";

import { chromium, FullConfig } from "@playwright/test";

dotenv.config({ path: path.resolve("apps/frontend/task-manager/.env") });

const AUTH_DIR = path.resolve("apps/frontend/task-manager/e2e/.auth");
const STORAGE_STATE_PATH = path.join(AUTH_DIR, "storage-state.json");
const TEST_USER_PATH = path.join(AUTH_DIR, "test-user.json");

const E2E_USERNAME = `e2e_user_${Date.now()}`;
const E2E_EMAIL = `e2e_${Date.now()}@test.local`;
const E2E_PASSWORD = process.env.E2E_PASSWORD!;

async function globalSetup(config: FullConfig) {
	const { baseURL } = config.projects[0].use;
	const headed = !!process.env.HEADED;

	console.log(`[setup] headed=${headed}, baseURL=${baseURL}`);
	console.log(`[setup] Registering user: ${E2E_USERNAME} (${E2E_EMAIL})`);

	fs.mkdirSync(AUTH_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: !headed });
	const context = await browser.newContext();
	const page = await context.newPage();

	try {
		// Go to the app — it will redirect to Authentik login
		await page.goto(baseURL!);
		console.log(`[setup] Navigated to ${baseURL}, waiting for Authentik redirect...`);
		await page.waitForURL("**/auth-flow-combined**", { timeout: 15000 });
		console.log(`[setup] On login page: ${page.url()}`);

		// Click the enrollment/sign-up link
		const signUpLink = page.locator("a[href*='task-manager-sign-up-flow']");

		await signUpLink.waitFor({ timeout: 10000 });
		await signUpLink.click();
		await page.waitForURL("**/task-manager-sign-up-flow**", { timeout: 10000 });
		console.log(`[setup] On sign-up page: ${page.url()}`);

		// Fill registration form
		await page.locator("input[name='username']").fill(E2E_USERNAME);
		await page.locator("input[name='email']").fill(E2E_EMAIL);
		await page.locator("input[name='password']").fill(E2E_PASSWORD);
		await page.locator("input[name='password_repeat']").fill(E2E_PASSWORD);

		// Submit
		await page.locator("button[type='submit']").click();
		console.log("[setup] Submitted registration form, waiting for redirect...");

		// Wait for redirect back to the app after successful registration + auto-login
		await page.waitForURL(`${baseURL}/**`, { timeout: 30000 });
		console.log(`[setup] Redirected to app: ${page.url()}`);

		// Wait for the app to fully load (profile API call should succeed)
		await page.waitForResponse(
			resp => resp.url().includes("/api/profile") && resp.status() === 200,
			{ timeout: 15000 }
		);
		console.log("[setup] Profile loaded successfully");

		// Save storage state (cookies + localStorage/sessionStorage)
		await context.storageState({ path: STORAGE_STATE_PATH });

		// Save test user info for teardown and tests
		const testUserInfo = JSON.stringify({
			username: E2E_USERNAME,
			email: E2E_EMAIL
		});

		fs.writeFileSync(TEST_USER_PATH, testUserInfo);
		console.log("[setup] Saved storage state and test user info");
	} catch (err) {
		// Save screenshot for debugging
		const screenshotPath = path.join(AUTH_DIR, "setup-failure.png");

		await page.screenshot({ path: screenshotPath, fullPage: true });
		console.error(`[setup] Failed! Screenshot saved to ${screenshotPath}`);
		console.error(`[setup] Current URL: ${page.url()}`);
		console.error(`[setup] Error:`, err);
		throw err;
	} finally {
		await browser.close();
	}
}

export default globalSetup;
