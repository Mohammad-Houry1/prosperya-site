import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(["/api", "/sitemap.xml", "/robots.txt"].map((path) => [path, {
      target: "http://127.0.0.1:8001", changeOrigin: true,
    }])),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    sourcemap: false,
    target: "es2022",
  },
});
