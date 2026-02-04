import { expect, test } from "./fixtures/auth";

test.describe("Authenticated User", () => {
	test("should access protected page after login", async ({ authenticatedPage }) => {
		await expect(authenticatedPage).toHaveURL(/localhost:1346/);
	});

	test("should have access token in localStorage", async ({ authenticatedPage }) => {
		const token = await authenticatedPage.evaluate(() => {
			return localStorage.getItem("access_token");
		});

		expect(token).toBeTruthy();
	});
});
