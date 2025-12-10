// import { StrictMode } from "react";

import "@ant-design/v5-patch-for-react-19";
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

const init = async () => {
	const user = await userManager.getUser();

	if (!user) {
		if (
			`${window.location.origin}${window.location.pathname}` ===
			import.meta.env.VITE_REDIRECT_URI
		) {
			await userManager.signinCallback();
		} else {
			await userManager.signinRedirect();
			return;
		}
	}

	insertAccessToken(async () => {
		const user = await userManager.getUser();

		if (!user) {
			throw new Error("User not found");
		}

		return user.access_token;
	});

	mount();
};

if (import.meta.env.DEV) {
	import("./wydr").then(init);
} else {
	init();
}

