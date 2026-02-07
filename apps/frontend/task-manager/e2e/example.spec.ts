import { expect, test } from "@playwright/test";

test.describe("authenticated user", () => {
	test("should be logged in and see the main page", async ({ page }) => {
		await page.goto("/");

		// Wait for the app to load after authentication
		await expect(page.locator("body")).toBeVisible();

		// Verify we're not on the callback page (auth completed)
		expect(page.url()).not.toContain("/callback");
	});
});
