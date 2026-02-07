import { BrowserContext, Page } from "@playwright/test";

export interface AuthConfig {
	authentikUrl: string;
	baseUrl: string;
	username: string;
	password: string;
}

const defaultConfig: AuthConfig = {
	authentikUrl: process.env.AUTHENTIK_URL || "http://localhost:9000",
	baseUrl: process.env.BASE_URL || "http://localhost:1346",
	username: "e2e-test-user",
	password: "e2e-test-password"
};

/**
 * Logs in to the application via Authentik OAuth2 flow.
 * This function navigates through the Authentik login UI and handles the OAuth callback.
 *
 * @param page - Playwright Page instance
 * @param config - Optional authentication configuration
 */
export async function loginViaAuthentik(
	page: Page,
	config: Partial<AuthConfig> = {}
): Promise<void> {
	const { authentikUrl, baseUrl, username, password } = {
		...defaultConfig,
		...config
	};

	// Navigate to the app - it will redirect to Authentik
	await page.goto(baseUrl);

	// Wait for redirect to Authentik login page
	await page.waitForURL(url => url.origin === authentikUrl, {
		timeout: 30000
	});

	// Fill in the login form
	// Authentik uses ak-flow-executor for the login flow
	await page.waitForSelector('input[name="uidField"]', { timeout: 15000 });

	// Enter username/email
	await page.fill('input[name="uidField"]', username);

	// Click the login/continue button
	await page.click('button[type="submit"]');

	// Wait for password field to appear (Authentik shows it after username)
	await page.waitForSelector('input[name="password"]', { timeout: 10000 });

	// Enter password
	await page.fill('input[name="password"]', password);

	// Submit the form
	await page.click('button[type="submit"]');

	// Wait for redirect back to the application
	await page.waitForURL(url => url.origin === baseUrl, {
		timeout: 30000
	});

	// Wait for the app to be fully loaded (callback processed)
	// The app redirects from /callback to the main page after processing
	await page.waitForURL(url => !url.pathname.includes("/callback"), {
		timeout: 15000
	});
}

/**
 * Saves the authentication state to a file for reuse in other tests.
 * This allows tests to skip the login flow by loading the saved state.
 *
 * @param context - Playwright BrowserContext instance
 * @param path - Path to save the storage state
 */
export async function saveAuthState(
	context: BrowserContext,
	path = ".auth/state.json"
): Promise<void> {
	await context.storageState({ path });
}

/**
 * Checks if the user is currently authenticated by looking for
 * OIDC tokens in localStorage.
 *
 * @param page - Playwright Page instance
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
	const storage = await page.evaluate(() => {
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);

			if (key && key.startsWith("oidc.user:")) {
				const value = localStorage.getItem(key);

				if (value) {
					try {
						const parsed = JSON.parse(value);

						return !!parsed.access_token;
					} catch {
						return false;
					}
				}
			}
		}
		return false;
	});

	return storage;
}

/**
 * Logs out the user by clearing the OIDC session.
 *
 * @param page - Playwright Page instance
 */
export async function logout(page: Page): Promise<void> {
	await page.evaluate(() => {
		for (let i = localStorage.length - 1; i >= 0; i--) {
			const key = localStorage.key(i);

			if (key && key.startsWith("oidc.")) {
				localStorage.removeItem(key);
			}
		}
	});

	await page.reload();
}
