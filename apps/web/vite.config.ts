import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4174",
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173,
    allowedHosts: ["azko-macbook.taild86cad.ts.net"]
  }
});
