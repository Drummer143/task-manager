import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, __dirname, "");

	const apiUrl = env.API_URL || "http://localhost:8080";
	const storageUrl = env.STORAGE_URL || "http://localhost:8082";
	const socketUrl = env.SOCKET_URL || "http://localhost:8078";

	return {
		root: __dirname,
		cacheDir: "../../../node_modules/.vite/apps/task-manager",
		server: {
			port: 1346,
			proxy: {
				"/api": {
					target: apiUrl,
					rewrite: path => path.replace(/^\/api/, "")
				},
				"/storage": {
					target: storageUrl,
					rewrite: path => path.replace(/^\/storage/, "")
				},
				"/socket": {
					target: socketUrl,
					ws: true
				}
			}
		},
		preview: {
			port: 2346,
			host: "localhost"
		},
		plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(["*.md"])],
		worker: {
			plugins: () => [nxViteTsPaths()]
		},
		build: {
			outDir: "../../../dist/apps/frontend/task-manager",
			emptyOutDir: true,
			reportCompressedSize: true,
			commonjsOptions: {
				transformMixedEsModules: true
			},
			rollupOptions: {
				output: {
					manualChunks: id => {
						if (id.includes("react-syntax-highlighter")) {
							return "syntax-highlighter";
						}
					}
				},
				plugins: [
					visualizer({
						filename: "../../../dist/apps/frontend/task-manager/stats.html"
					})
				]
			}
		},
		resolve: {},
		test: {
			watch: false,
			globals: true,
			environment: "jsdom",
			include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
			reporters: ["default"],
			coverage: {
				reportsDirectory: "../../../coverage/apps/task-manager",
				provider: "v8" as const,
				include: ["src/**/*.{ts,tsx}"]
			}
		}
	};
});

