import { cpSync, rmSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Vercel cannot run PHP or MySQL, so a build there gets the browser-only preview instead of the server.
const preview = Boolean(process.env.VERCEL || process.env.PREVIEW);

// The build is one folder to upload: the page, and the PHP beside it. config.php stays on the server.
const withApi = {
  name: "with-api",
  closeBundle() {
    cpSync("api", "dist/api", { recursive: true });
    rmSync("dist/api/config.php", { force: true });
  },
};

export default defineConfig({
  base: "./",
  define: { __PREVIEW__: JSON.stringify(preview) },
  build: { target: "es2022" },
  plugins: preview ? [react()] : [react(), withApi],
  server: { proxy: { "/api": "http://127.0.0.1:8099" } },
});
