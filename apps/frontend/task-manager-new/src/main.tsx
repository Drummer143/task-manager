// import { StrictMode } from "react";

import { insertAccessToken } from "@task-manager/api";
import "antd/dist/reset.css";
import { createRoot } from "react-dom/client";

import App from "./app/App";
import Providers from "./app/Providers";
import { userManager } from "./app/userManager";
import "./index.css";

const mount = () =>
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	createRoot(document.getElementById("root")!).render(
		// <StrictMode>
		<Providers>
			<App />
		</Providers>
		// </StrictMode>
	);

let removeAccessToken: (() => void) | undefined;

const isCallbackPage = () =>
	window.location.pathname === "/callback" ||
	`${window.location.origin}${window.location.pathname}` ===
		import.meta.env.VITE_REDIRECT_URI;

const init = async () => {
	removeAccessToken?.();

	if (isCallbackPage()) {
		try {
			await userManager.signinCallback();
		} catch (e) {
			console.error("signinCallback failed", e);
		}

		const returnTo = sessionStorage.getItem("auth_return_to") || "/";

		sessionStorage.removeItem("auth_return_to");
		window.location.replace(returnTo);
		return;
	}

	let user = await userManager.getUser();

	if (user && user.expired) {
		try {
			user = await userManager.signinSilent();
		} catch {
			// silent renew failed — fall back to redirect
		}
	}

	if (!user || user.expired) {
		sessionStorage.setItem("auth_return_to", window.location.pathname + window.location.search);
		await userManager.signinRedirect();
		return;
	}

	removeAccessToken = insertAccessToken(async () => {
		const user = await userManager.getUser();

		if (!user) {
			throw new Error("User not found");
		}

		return user.access_token;
	});

	userManager.events.addSilentRenewError(() => {
		userManager.signinRedirect();
	});

	mount();
};

if (import.meta.env.DEV) {
	import("./wydr").then(init);
} else {
	init();
}

