import { test as base, type BrowserContext, type Page } from "@playwright/test";

export const E2E_USER = {
	username: "e2e-test-user",
	password: "e2e-test-password",
	email: "e2e@test.local"
};

export const AUTHENTIK_CONFIG = {
	baseUrl: process.env["AUTHENTIK_URL"] || "http://localhost:9000",
	clientId: "e2e-test-client",
	appSlug: "task-manager"
};

export async function loginViaUI(page: Page): Promise<void> {
	const params = new URLSearchParams({
		client_id: AUTHENTIK_CONFIG.clientId,
		redirect_uri: page.url(),
		response_type: "code",
		scope: "openid profile email"
	});
	const authUrl = `${AUTHENTIK_CONFIG.baseUrl}/application/o/authorize/?${params}`;

	await page.goto(authUrl);

	await page.waitForSelector('input[name="uidField"]', { timeout: 10000 });
	await page.fill('input[name="uidField"]', E2E_USER.username);
	await page.click('button[type="submit"]');

	await page.waitForSelector('input[name="password"]', { timeout: 10000 });
	await page.fill('input[name="password"]', E2E_USER.password);
	await page.click('button[type="submit"]');

	await page.waitForURL(/.*callback.*|.*localhost:1346.*/, { timeout: 15000 });
}

export async function loginViaAPI(context: BrowserContext): Promise<string> {
	const tokenEndpoint = `${AUTHENTIK_CONFIG.baseUrl}/application/o/token/`;

	const response = await context.request.post(tokenEndpoint, {
		form: {
			grant_type: "password",
			client_id: AUTHENTIK_CONFIG.clientId,
			username: E2E_USER.username,
			password: E2E_USER.password,
			scope: "openid profile email"
		}
	});

	if (!response.ok()) {
		const text = await response.text();

		throw new Error(`Failed to get token: ${response.status()} ${text}`);
	}

	const data = await response.json();

	return data.access_token;
}

export async function setAuthToken(page: Page, token: string): Promise<void> {
	await page.evaluate(accessToken => {
		localStorage.setItem("access_token", accessToken);
	}, token);
}

export async function setupAuthenticatedSession(
	page: Page,
	context: BrowserContext
): Promise<void> {
	const token = await loginViaAPI(context);

	await page.goto("/");
	await setAuthToken(page, token);
	await page.reload();
}

type AuthFixtures = {
	authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
	authenticatedPage: async ({ page, context }, use) => {
		await setupAuthenticatedSession(page, context);
		// eslint-disable-next-line react-hooks/rules-of-hooks
		await use(page);
	}
});

export { expect } from "@playwright/test";
