import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
// import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    // viteStaticCopy({
    //   targets: [
    //     {
    //       src: path.join(__dirname, "node_modules", "mediainfo.js", "dist", "MediaInfoModule.wasm"),
    //       dest: "public",
    //     },
    //   ],
    // }),
  ],

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },

  // 使用 `TAURI_ENV_PLATFORM`、`TAURI_ENV_ARCH`、`TAURI_ENV_DEBUG` 等环境变量
  envPrefix: ["VITE_", "TAURI_"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
}));
