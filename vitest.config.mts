import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Os testes de unidade: o conteúdo, a marcação dos textos e o shell do prompt. O que
// depende do navegador fica nos testes do Playwright (tests/navegador).
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  test: { include: ["tests/unidade/**/*.test.{ts,tsx}"], environment: "node" },
});
