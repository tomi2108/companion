import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    watch: false,
    clearMocks: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      reporter: ["html", "clover", "json"],
      provider: "v8",
      clean: true,
      all: true
    }
  }
});
