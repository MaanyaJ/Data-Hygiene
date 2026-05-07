import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "details",
      filename: "remoteEntry.js",
      exposes: {
        "./DetailsPage": "./src/pages/DetailsPage.jsx",
      },
      remotes: {
        shell: "http://localhost:5000/assets/remoteEntry.js",
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
