// import { StrictMode } from "react";

import { insertAccessToken } from "@task-manager/api";
import "antd/dist/reset.css";
import { createRoot } from "react-dom/client";

import App from "./app/App";
import { userManager } from "./app/auth";
import Providers from "./app/Providers";
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

const init = async () => {
	const user = await userManager.getUser(true);

	if (!user) {
		if (window.location.href.includes(import.meta.env.VITE_REDIRECT_URI)) {
			userManager.signinCallback();
		} else {
			userManager.signinRedirect();
			return;
		}
	} else {
		insertAccessToken(async () => {
			const user = await userManager.getUser(true);

			if (!user) {
				throw new Error("User not found");
			}

			return user.access_token;
		});
	}

	mount();
};

if (import.meta.env.DEV) {
	import("./wydr").then(init);
} else {
	init();
}

