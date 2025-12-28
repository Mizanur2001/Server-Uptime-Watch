import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Keep compatibility with existing CRA-style env vars (REACT_APP_*)
  envPrefix: ["VITE_", "REACT_APP_"],
  test: {
    include: ["src/**/*.test.jsx"],
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
