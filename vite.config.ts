import { defineConfig } from "vitest/config";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "node:url";

const base = process.env.PAGES_BASE ?? "/";

export default defineConfig({
  base,
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  worker: { format: "es" },
  plugins: [
    svelte(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "HexGoden",
        short_name: "HexGoden",
        description: "A contemplative water god game on a hexagonal planet.",
        theme_color: "#0e1026",
        background_color: "#0e1026",
        display: "standalone",
        orientation: "any",
        start_url: base,
        scope: base,
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: { globPatterns: ["**/*.{js,css,html,svg,png,woff2}"] },
    }),
  ],
  test: { include: ["tests/**/*.test.ts"] },
});
