/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";

export default defineConfig(() => ({
	root: __dirname,
	cacheDir: "../../../node_modules/.vite/apps/task-manager",
	server: {
		port: 1346
	},
	preview: {
		port: 2346,
		host: "localhost"
	},
	plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(["*.md"])],
	// Uncomment this if you are using workers.
	// worker: {
	//  plugins: [ nxViteTsPaths() ],
	// },
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
					filename: "../../../dist/apps/frontend/task-manager/stats.html",
					// open: true
				})
			]
		}
	},
	resolve: {
		// alias: {
		//   "shared": resolve(__dirname, "./src/shared"),
		//   "pages": resolve(__dirname, "./src/pages"),
		//   "widgets": resolve(__dirname, "./src/widgets"),
		//   "api": resolve(__dirname, "./src/app/api"),
		//   "store": resolve(__dirname, "./src/app/store")
		// }
	},
	test: {
		watch: false,
		globals: true,
		environment: "jsdom",
		include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
		reporters: ["default"],
		coverage: {
			reportsDirectory: "../../../coverage/apps/task-manager",
			provider: "v8" as const
		}
	}
}));

