import { defineConfig, devices } from "@playwright/test";

// Os testes no navegador, contra o build de produção (rode npm run build antes): no
// computador e num celular de verdade emulado (toque, tela estreita).
const PORTA = 3100;

export default defineConfig({
  testDir: "tests/navegador",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${PORTA}`, trace: "on-first-retry" },
  projects: [
    { name: "computador", use: { ...devices["Desktop Chrome"] } },
    { name: "celular", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: `npx next start -p ${PORTA}`,
    url: `http://localhost:${PORTA}`,
    reuseExistingServer: !process.env.CI,
  },
});
