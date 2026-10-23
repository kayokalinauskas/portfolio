import { expect, test, type Page } from "@playwright/test";

// O que só dá para conferir num navegador: as páginas abrem, nada passa da largura da tela
// no celular, e as teclas, a busca e o prompt funcionam. Roda no computador e no celular.

const PAGINAS = [
  "/",
  "/kayo-ozamigos",
  "/kayo-finalizadoras",
  "/kayo-acelerato",
  "/en",
  "/en/kayo-ozamigos",
  "/en/kayo-finalizadoras",
  "/en/kayo-acelerato",
];

// Com o JavaScript ainda carregando, a barra não responde às teclas: espera o React assumir.
async function abrir(page: Page, caminho: string) {
  await page.goto(caminho);
  await expect(page.locator("main article#manual")).toBeVisible();
  await page.waitForFunction(() => document.readyState === "complete");
}

for (const caminho of PAGINAS) {
  test(`${caminho} abre com o manual e o título certo`, async ({ page }) => {
    const resposta = await page.goto(caminho);
    expect(resposta?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page).toHaveTitle(/\(1\)$/);
  });

  test(`${caminho} não passa da largura da tela em 320 px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(caminho);
    const larguras = await page.evaluate(() => ({ pagina: document.documentElement.scrollWidth, tela: innerWidth }));
    expect(larguras.pagina).toBeLessThanOrEqual(larguras.tela);
  });
}

test("um endereço que não existe responde 404 com a página do manual", async ({ page }) => {
  const resposta = await page.goto("/kayo-nada");
  expect(resposta?.status()).toBe(404);
  await expect(page.getByText("Nenhuma entrada de manual para kayo-nada")).toBeVisible();
});

test("o título de uma seção é o link dela", async ({ page }) => {
  await abrir(page, "/#historico");
  await expect(page.locator("h2#historico a")).toHaveAttribute("href", "#historico");
  await expect(page.locator("h2#historico")).toBeInViewport();
});

test("os botões da barra abrem e fecham a ajuda", async ({ page }) => {
  await abrir(page, "/");
  const ajuda = page.getByRole("button", { name: /ajuda/ });
  await ajuda.click();
  await expect(page.getByRole("dialog")).toContainText("RESUMO DOS COMANDOS DO LESS");
  await ajuda.click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("a busca acende enquanto digita, e o esc desiste", async ({ page }) => {
  await abrir(page, "/");
  await page.getByRole("button", { name: /buscar/ }).click();
  const campo = page.locator("#busca");
  await campo.pressSequentially("Bluesoft");
  await expect(page.locator("form [aria-live]")).toHaveText(/^1\/\d+$/);
  await campo.press("Escape");
  await expect(campo).toHaveCount(0);
  expect(await page.evaluate(() => CSS.highlights?.get("busca")?.size ?? 0)).toBe(0);
});

test("no prompt, o Tab completa e o Enter abre a página", async ({ page }) => {
  await abrir(page, "/");
  await page.getByRole("button", { name: /prompt/ }).click();
  const shell = page.locator("#shell");
  await expect(shell).toBeFocused();
  await shell.pressSequentially("man kayo-oz");
  await shell.press("Tab");
  await expect(shell).toHaveValue("man kayo-ozamigos ");
  await shell.press("Enter");
  await expect(page).toHaveURL(/\/kayo-ozamigos$/);
});

test("no prompt, ↑ volta aos comandos anteriores", async ({ page }) => {
  await abrir(page, "/");
  await page.getByRole("button", { name: /prompt/ }).click();
  const shell = page.locator("#shell");
  for (const comando of ["pwd", "whoami"]) {
    await shell.fill(comando);
    await shell.press("Enter");
  }
  await expect(page.getByRole("region", { name: "shell" })).toContainText("/Users/kayo");
  await shell.press("ArrowUp");
  await expect(shell).toHaveValue("whoami");
  await shell.press("ArrowUp");
  await expect(shell).toHaveValue("pwd");
});

test("a página em inglês fala inglês na barra e na ajuda", async ({ page }) => {
  await abrir(page, "/en");
  await page.getByRole("button", { name: /help/ }).click();
  await expect(page.getByRole("dialog")).toContainText("SUMMARY OF LESS COMMANDS");
});
