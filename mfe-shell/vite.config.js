import { moduleFederation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    moduleFederation({
      name: "shell",
      filename: "remoteEntry.js",
      exposes: {
        "./Navbar": "./src/components/Navbar.jsx",
        "./Loader": "./src/components/Loader.jsx",
        "./ErrorPage": "./src/components/ErrorPage.jsx",
      },
      remotes: {
        dashboard: "dashboard@http://localhost:5001/remoteEntry.js",
        details: "details@http://localhost:5002/remoteEntry.js",
      },
      shared: ["react", "react-dom", "react-router-dom", "@mui/material", "@emotion/react", "@emotion/styled"],
    }),
  ],
  build: {
    target: "esnext",
  },
});
