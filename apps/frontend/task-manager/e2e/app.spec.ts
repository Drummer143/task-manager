import { expect, test } from "@playwright/test";

test.describe("Task Manager App", () => {
	test("should load the application", async ({ page }) => {
		await page.goto("/");

		await expect(page).toHaveTitle(/Vite.*React/i);
	});

	test("should display main page content", async ({ page }) => {
		await page.goto("/");

		await page.waitForLoadState("networkidle");
	});
});
