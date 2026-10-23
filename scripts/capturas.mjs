// As capturas de tela do README, nos dois temas, a partir do build de produção.
// Uso: npm run build, depois npm run capturas (sobe o site na porta 3007 e fotografa).
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";

const PORTA = 3007;
// o next direto pelo node, sem shell no meio: assim o kill encerra o servidor também no Windows
const servidor = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(PORTA)], { stdio: "ignore" });

try {
  for (let i = 0; i < 60; i++) {
    const pronto = await fetch(`http://localhost:${PORTA}/`).then(
      (r) => r.ok,
      () => false,
    );
    if (pronto) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  const navegador = await chromium.launch();
  for (const [tema, esquema] of [
    ["claro", "light"],
    ["escuro", "dark"],
  ]) {
    const pagina = await navegador.newPage({
      viewport: { width: 1200, height: 860 },
      colorScheme: esquema,
      deviceScaleFactor: 2,
    });
    await pagina.goto(`http://localhost:${PORTA}/`);
    await pagina.evaluate(() => document.fonts.ready);
    await pagina.screenshot({ path: `docs/captura-${tema}.png` });
    await pagina.close();
    console.log(`docs/captura-${tema}.png`);
  }
  await navegador.close();
} finally {
  servidor.kill();
}
