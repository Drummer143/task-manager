import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: ["apps/**/vite.config.{mjs,js,ts,mts}", "libs/**/vite.config.{mjs,js,ts,mts}"]
	}
});

