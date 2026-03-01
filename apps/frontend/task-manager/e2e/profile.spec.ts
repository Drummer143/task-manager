import path from "node:path";
import { expect, getTestUser, test, updateTestUser } from "./fixtures/auth";
import { v4 as uuidV4 } from "uuid";

test("should update username in user menu", async ({ page }) => {
	await page.goto("/profile");

	let user = getTestUser();

	const newUserName = `e2e_test_user_${uuidV4()}`;

	await page.getByTestId("profile-username-input").fill(newUserName);

	await Promise.all([
		page.waitForResponse(
			response =>
				response.ok() &&
				response.request().method() === "PUT" &&
				response.url().endsWith("/profile")
		),
		page.getByTestId("profile-save-button").click()
	]);

	updateTestUser({
		username: newUserName,
		email: user.email
	});

	await expect(page.getByTestId("user-menu-top-right-info-username")).toHaveText(newUserName);
});

test("should update avatar", async ({ page }) => {
	const avatarPath = path.join(__dirname, "./fixtures/avatar.png");

	await page.goto("/profile");

	let screenshotBefore = await page.getByTestId("user-menu-top-right-info-avatar").screenshot();

	await page.getByTestId("avatar-input").setInputFiles(avatarPath);

	await Promise.all([
		page.waitForResponse(
			response =>
				response.ok() &&
				response.request().method() === "PUT" &&
				response.url().endsWith("/profile/avatar")
		),
		page.locator("#image-crop-ok-button").click()
	]);

	await page.waitForFunction(selector => {
		const img = document.querySelector(selector) as HTMLImageElement;
		return img.complete && img.naturalWidth > 0;
	}, '[data-test-id="user-menu-top-right-info-avatar"] img');

	let screenshotAfter = await page.getByTestId("user-menu-top-right-info-avatar").screenshot();

	expect(screenshotBefore).not.toEqual(screenshotAfter);
});
