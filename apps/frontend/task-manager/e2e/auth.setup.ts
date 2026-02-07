import { test as setup } from "@playwright/test";

import { loginViaAuthentik, saveAuthState } from "./utils/auth";

const authFile = ".auth/state.json";

setup("authenticate", async ({ page, context }) => {
	await loginViaAuthentik(page);
	await saveAuthState(context, authFile);
});
