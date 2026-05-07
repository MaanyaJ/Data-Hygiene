import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      filename: "remoteEntry.js",
      exposes: {
        "./Navbar": "./src/components/Navbar.jsx",
        "./Loader": "./src/components/Loader.jsx",
        "./ErrorPage": "./src/components/ErrorPage.jsx",
      },
      remotes: {
        dashboard: "http://localhost:5001/assets/remoteEntry.js",
        details: "http://localhost:5002/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom", "react-router-dom", "@mui/material", "@emotion/react", "@emotion/styled"],
    }),
  ],
  build: {
    modulePreload: false,
    target: "esnext",
    minify: false,
    cssCodeSplit: false,
  },
});
