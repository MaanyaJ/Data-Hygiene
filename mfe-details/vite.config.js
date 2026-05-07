import { moduleFederation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    moduleFederation({
      name: "details",
      filename: "remoteEntry.js",
      exposes: {
        "./DetailsPage": "./src/pages/DetailsPage.jsx",
      },
      remotes: {
        shell: "shell@http://localhost:5000/remoteEntry.js",
      },
      shared: ["react", "react-dom", "react-router-dom", "@mui/material", "@emotion/react", "@emotion/styled"],
    }),
  ],
  build: {
    target: "esnext",
  },
});
