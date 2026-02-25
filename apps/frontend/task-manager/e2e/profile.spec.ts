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
