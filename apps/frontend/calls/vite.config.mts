/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin";
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

function loadCerts() {
	const certsDir = path.resolve(import.meta.dirname, "../../../certs");
	const keyPath = path.join(certsDir, "localhost-key.pem");
	const certPath = path.join(certsDir, "localhost.pem");

	if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
		return {
			key: fs.readFileSync(keyPath),
			cert: fs.readFileSync(certPath)
		};
	}

	return undefined;
}

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, import.meta.dirname, "");

	const apiUrl = env.API_URL || "http://localhost:8080";
	const storageUrl = env.STORAGE_URL || "http://localhost:8082";
	const socketUrl = env.SOCKET_URL || "http://localhost:8078";
	const callsApiUrl = env.CALLS_API_URL || "http://localhost:8084";

	const https = loadCerts();

	return {
		root: import.meta.dirname,
		cacheDir: "../../../node_modules/.vite/apps/frontend/calls",
		server: {
			port: 1347,
			host: "localhost",
			https,
			proxy: {
				"/api": {
					target: apiUrl,
					changeOrigin: true,
					secure: false,
					rewrite: path => path.replace(/^\/api/, "")
				},
				"/storage": {
					target: storageUrl,
					changeOrigin: true,
					secure: false,
					rewrite: path => path.replace(/^\/storage/, "")
				},
				"/socket": {
					target: socketUrl,
					changeOrigin: true,
					secure: false,
					ws: true
				},
				"/calls-api": {
					target: callsApiUrl,
					changeOrigin: true,
					secure: false,
					rewrite: path => path.replace(/^\/calls-api/, "")
				}
			}
		},
		preview: {
			port: 1347,
			host: "localhost"
		},
		plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(["*.md"])],
		// Uncomment this if you are using workers.
		// worker: {
		//  plugins: [ nxViteTsPaths() ],
		// },
		build: {
			outDir: "../../../dist/apps/frontend/calls",
			emptyOutDir: true,
			reportCompressedSize: true,
			commonjsOptions: {
				transformMixedEsModules: true
			}
		},
		test: {
			name: "calls",
			watch: false,
			globals: true,
			environment: "jsdom",
			include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
			reporters: ["default"],
			coverage: {
				reportsDirectory: "../../../coverage/apps/frontend/calls",
				provider: "v8" as const
			}
		}
	};
});
