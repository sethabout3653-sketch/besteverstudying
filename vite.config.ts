import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";

export default defineConfig(async ({ command, mode }) => {
  const plugins = [
    tsconfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      importProtection: {
        behavior: "error",
        client: {
          files: ["**/server/**"],
          specifiers: ["server-only"],
        },
      },
      server: { entry: "server" },
    }),
    react(),
  ];

  if (mode === "development") {
    try {
      const { devtools } = await import("@tanstack/devtools-vite");
      plugins.unshift(
        devtools({
          logging: false,
          eventBusConfig: { enabled: false },
          enhancedLogs: { enabled: false },
          consolePiping: { enabled: false },
          removeDevtoolsOnBuild: false,
          injectSource: { enabled: true },
        }),
      );
    } catch (err) {
      console.warn("Could not load @tanstack/devtools-vite:", err);
    }
  }

  if (command === "build") {
    try {
      const { nitro } = await import("nitro/vite");
      plugins.push(
        nitro({
          preset: process.env.NITRO_PRESET || (process.env.VERCEL ? "vercel" : "node-server"),
        }),
      );
    } catch (err) {
      console.warn("Could not load nitro/vite plugin:", err);
    }
  }

  return {
    plugins,
  };
});
