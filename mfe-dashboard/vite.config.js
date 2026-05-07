import { moduleFederation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react(),
    moduleFederation({
      name: "dashboard",
      filename: "remoteEntry.js",
      exposes: {
        "./RecordsListPage": "./src/pages/RecordsListPage.jsx",
      },
      remotes: {
        shell: "shell@http://localhost:5000/remoteEntry.js",
      },
      shared: {
        react: { singleton: true },
        "react-dom": { singleton: true },
        "react-router-dom": { singleton: true },
        "@mui/material": { singleton: true },
        "@emotion/react": { singleton: true },
        "@emotion/styled": { singleton: true },
      },
    }),
  ],
  build: {
    target: "esnext",
  },
});
