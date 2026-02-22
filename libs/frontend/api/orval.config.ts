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
			override: {
				mutator: {
					path: "./src/fetcher.ts",
					name: "fetcher"
				}
				// fetch: {
				// 	forceSuccessResponse: true
				// }
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
			override: {
				mutator: {
					path: "./src/fetcher.ts",
					name: "fetcher"
				}
				// fetch: {
				// 	forceSuccessResponse: true
				// }
			}
		}
	}
});

