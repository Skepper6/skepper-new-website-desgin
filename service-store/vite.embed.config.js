import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// One file that another website can load: dist/embed/store.js
const preview = Boolean(process.env.VERCEL || process.env.PREVIEW);

export default defineConfig({
  base: "./",
  define: { __PREVIEW__: JSON.stringify(preview), __EMBED__: "true" },
  publicDir: false,
  plugins: [react()],
  build: {
    target: "es2022",
    outDir: process.env.OUT ? process.env.OUT + "/embed" : "dist/embed",
    emptyOutDir: true,
    modulePreload: false,
    rollupOptions: { input: "src/embed.jsx", output: { format: "es", entryFileNames: "store.js", inlineDynamicImports: true } },
  },
});
