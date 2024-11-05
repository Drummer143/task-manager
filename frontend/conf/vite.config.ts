import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 5174
	},
	resolve: {
		alias: {
			shared: resolve(__dirname, "./src/shared"),
			pages: resolve(__dirname, "./src/pages"),
			widgets: resolve(__dirname, "./src/widgets"),
			api: resolve(__dirname, "./src/app/api"),
			store: resolve(__dirname, "./src/app/store")
		}
	}
});

