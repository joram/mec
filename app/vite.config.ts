import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    allowedHosts: [".env.veilstreamapp.com", ".env.veilstreamdev.com"],
    proxy: {
      "/api": {
        // API_PROXY_TARGET is a server-side-only variable — it is never baked into
        // the browser bundle, so the frontend always uses the relative /api path
        // and the Vite dev-server proxy handles routing to the API container.
        target: process.env.API_PROXY_TARGET || "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
