import { sveltekit } from "@sveltejs/kit/vite";
import adapter from "@sveltejs/adapter-vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import process from "process";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      sveltekit({
        adapter: adapter(),
      }),
      tailwindcss(),
    ],
    define: {
      EVENTIFY_BASEURL: JSON.stringify(
        process.env.VITE_EVENTIFY_BASEURL || env.VITE_EVENTIFY_BASEURL || "http://localhost:3000/api"
      ),
    },
    resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./vitest-setup.ts"],
    },
  };
});