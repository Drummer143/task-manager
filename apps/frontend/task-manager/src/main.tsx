import { StrictMode } from "react";

import "antd/dist/reset.css";
import { createRoot } from "react-dom/client";

import App from "./app/App";
import Providers from "./app/Providers";
import "./index.css";

const mount = () =>
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	createRoot(document.getElementById("root")!).render(
		<StrictMode>
			<Providers>
				<App />
			</Providers>
		</StrictMode>
	);

if (import.meta.env.DEV) {
	import("./wydr").then(mount);
} else {
	mount();
}