import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      filename: "remoteEntry.js",
      dts: false,
      remotes: {
        dashboard: {
          type: "module",
          name: "dashboard",
          entry: "http://localhost:5001/remoteEntry.js",
        },
        details: {
          type: "module",
          name: "details",
          entry: "http://localhost:5002/remoteEntry.js",
        },
      },
      exposes: {
        "./Navbar": "./src/components/Navbar.jsx",
        "./Loader": "./src/components/Loader.jsx",
        "./ErrorPage": "./src/components/ErrorPage.jsx",
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
    minify: false,
    cssCodeSplit: false,
  },
});
