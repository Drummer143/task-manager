import { defineConfig } from "orval";

export default defineConfig({
	main: {
		input: {
			target: "./specs/openapi-main.json"
		},
		output: {
			target: "./src/generated/main/index.ts",
			schemas: "./src/generated/main/schemas",
			client: "axios-functions",
			mode: "split",
			clean: true,
			baseUrl: "/api",
			override: {
				mutator: {
					path: "./src/fetcher.ts",
					name: "fetcher"
				}
			}
		}
	},
	storage: {
		input: {
			target: "./specs/openapi-storage.json"
		},
		output: {
			target: "./src/generated/storage/index.ts",
			schemas: "./src/generated/storage/schemas",
			client: "axios-functions",
			mode: "split",
			clean: true,
			baseUrl: "/storage",
			override: {
				mutator: {
					path: "./src/fetcher.ts",
					name: "fetcher"
				}
			}
		}
	},
	calls: {
		input: {
			target: "./specs/openapi-calls.json"
		},
		output: {
			target: "./src/generated/calls/index.ts",
			schemas: "./src/generated/calls/schemas",
			client: "axios-functions",
			mode: "split",
			clean: true,
			baseUrl: "/calls-api",
			override: {
				mutator: {
					path: "./src/fetcher.ts",
					name: "fetcher"
				}
			}
		}
	}
});

