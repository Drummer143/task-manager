import { expect, test } from "./fixtures/auth";

let pageName: string;

test("should create board", async ({ page }) => {
	await page.goto("/profile");

	await page.getByTestId("nav-pages-menu-create-page-button").click();

	pageName = "test_board_" + Date.now();
	await page.getByTestId("create-page-drawer-title-input").fill(pageName);

	await page.getByTestId("create-page-drawer-type-select").click();
	await page.locator(".ant-select-item[title='board']").click();

	await page.getByTestId("create-page-drawer-submit-button").click();

	await page.waitForRequest(/pages/);

	await expect(page.getByText(pageName)).toBeVisible();
});

