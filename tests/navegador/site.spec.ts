import { expect, test, type Page } from "@playwright/test";

// O que só dá para conferir num navegador: as páginas abrem, nada passa da largura da tela
// no celular, e a ajuda, a busca e o prompt funcionam. Cada teste roda onde faz diferença:
// o que não depende da tela roda uma vez (no computador), a largura só no celular, o
// teclado físico (Tab, ↑) só no computador, e o que muda entre mouse e toque nos dois.

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

const noComputador = () => test.skip(({ isMobile }) => isMobile, "não depende da tela: roda uma vez, no computador");
const noCelular = () => test.skip(({ isMobile }) => !isMobile, "só faz sentido na tela estreita");

// Com o JavaScript ainda carregando, a barra não responde: espera a página terminar.
async function abrir(page: Page, caminho: string) {
  await page.goto(caminho);
  await page.waitForFunction(() => document.readyState === "complete");
}

test.describe("as páginas", () => {
  noComputador();

  test("as oito abrem, com um h1 e o título da página de manual", async ({ page }) => {
    for (const caminho of PAGINAS) {
      const resposta = await page.goto(caminho);
      expect(resposta?.status(), caminho).toBe(200);
      await expect(page.locator("h1"), caminho).toHaveCount(1);
      await expect(page, caminho).toHaveTitle(/\(1\)$/);
    }
  });

  test("um endereço que não existe responde 404 com a página do manual", async ({ page }) => {
    const resposta = await page.goto("/kayo-nada");
    expect(resposta?.status()).toBe(404);
    await expect(page.getByText("Nenhuma entrada de manual para kayo-nada")).toBeVisible();
  });

  test("a página em inglês fala inglês na barra e na ajuda", async ({ page }) => {
    await abrir(page, "/en");
    await page.getByRole("button", { name: /help/ }).click();
    await expect(page.getByRole("dialog")).toContainText("SUMMARY OF LESS COMMANDS");
  });

  test("o título de uma seção é o link dela", async ({ page }) => {
    await abrir(page, "/#historico");
    await expect(page.locator("h2#historico a")).toHaveAttribute("href", "#historico");
    await expect(page.locator("h2#historico")).toBeInViewport();
  });
});

test.describe("o celular", () => {
  noCelular();

  test("nenhuma página passa da largura da tela em 320 px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const caminho of PAGINAS) {
      await page.goto(caminho);
      const larguras = await page.evaluate(() => ({ pagina: document.documentElement.scrollWidth, tela: innerWidth }));
      expect(larguras.pagina, caminho).toBeLessThanOrEqual(larguras.tela);
    }
  });
});

test.describe("a barra do less", () => {
  test("os botões abrem e fecham a ajuda", async ({ page }) => {
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
});

test.describe("o prompt", () => {
  noComputador();

  test("o Tab completa e o Enter abre a página", async ({ page }) => {
    await abrir(page, "/");
    await page.getByRole("button", { name: /shell/ }).click();
    const shell = page.locator("#shell");
    await expect(shell).toBeFocused();
    await shell.pressSequentially("man kayo-oz");
    await shell.press("Tab");
    await expect(shell).toHaveValue("man kayo-ozamigos ");
    await shell.press("Enter");
    await expect(page).toHaveURL(/\/kayo-ozamigos$/);
  });

  test("kayo --sql mostra a explicação da opção, e ↑ volta aos comandos anteriores", async ({ page }) => {
    await abrir(page, "/");
    await page.getByRole("button", { name: /shell/ }).click();
    const shell = page.locator("#shell");
    for (const comando of ["pwd", "kayo --sql"]) {
      await shell.fill(comando);
      await shell.press("Enter");
    }
    const saida = page.getByRole("region", { name: "shell" });
    await expect(saida).toContainText("/Users/kayo");
    await expect(saida).toContainText("PostgreSQL e Oracle");
    await shell.press("ArrowUp");
    await expect(shell).toHaveValue("kayo --sql");
    await shell.press("ArrowUp");
    await expect(shell).toHaveValue("pwd");
  });
});
