import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: `http://${process.env.HOST || "localhost"}:${process.env.PORT || "8001"}`,
        changeOrigin: true,
      },
    },
  },
});
