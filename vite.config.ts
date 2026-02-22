import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./src/manifest.json" with { type: "json" };

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  server: {
    host: "localhost",
    port: 5173,
    strictPort: true,
    cors: {
      origin: /^chrome-extension:\/\/.*/,
    },
  },
  build: {
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
      },
    },
  },
});
