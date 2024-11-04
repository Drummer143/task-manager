import { StrictMode } from "react";

import "antd/dist/reset.css";
import { createRoot } from "react-dom/client";

import App from "./app/App";
import Providers from "./app/Providers";
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<Providers>
			<App />
		</Providers>
	</StrictMode>
);
