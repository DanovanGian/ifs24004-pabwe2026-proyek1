import { sveltekit } from "@sveltejs/kit/vite";
import adapter from "@sveltejs/adapter-vercel";
import tailwindcss from "@tailwindcss/vite";
import { svelteTesting } from "@testing-library/svelte/vite";
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
      svelteTesting(),
    ],
    define: {
      EVENTIFY_BASEURL: JSON.stringify(
        env.VITE_EVENTIFY_BASEURL || "http://localhost:3000/api"
      ),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./src/setupTests.ts",
    },
  };
});
