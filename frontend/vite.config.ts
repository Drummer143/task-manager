import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 1346
  },
  preview: {
    port: 1246
  },
  build: {
    sourcemap: true
  },
  resolve: {
    alias: {
      "shared": resolve(__dirname, "./src/shared"),
      "pages": resolve(__dirname, "./src/pages"),
      "widgets": resolve(__dirname, "./src/widgets"),
      "api": resolve(__dirname, "./src/app/api"),
      "store": resolve(__dirname, "./src/app/store"),
    }
  }
})
