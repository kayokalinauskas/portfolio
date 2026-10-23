// O que a sessão faz no navegador: o último login, o tema e o realce da busca.

import { formatarLogin } from "./formatos";

// O último acesso é lido e regravado uma vez por carregamento da página; navegar entre as
// páginas do manual não conta como um login novo.
let ultimoLogin: string | null = null;

export function lerLogin() {
  if (ultimoLogin === null) {
    let anterior: Date | null = null;
    try {
      const guardado = localStorage.getItem("ultimo-acesso");
      if (guardado) anterior = new Date(guardado);
      localStorage.setItem("ultimo-acesso", new Date().toISOString());
    } catch {
      // sem armazenamento: mostra a hora de agora
    }
    ultimoLogin = formatarLogin(anterior && !isNaN(+anterior) ? anterior : new Date());
  }
  return ultimoLogin;
}

// o login não muda depois de lido: o useSyncExternalStore não tem o que escutar
export const semMudancas = () => () => {};

// A barra do navegador no celular segue o tema escolhido aqui, não só o do sistema.
export function pintarBarraDoNavegador() {
  const fundo = getComputedStyle(document.documentElement).getPropertyValue("--fundo").trim();
  if (!fundo) return;
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", fundo));
}

export function trocarTema() {
  const raiz = document.documentElement;
  const escuroAgora = raiz.dataset.theme
    ? raiz.dataset.theme === "dark"
    : window.matchMedia("(prefers-color-scheme: dark)").matches;
  raiz.dataset.theme = escuroAgora ? "light" : "dark";
  pintarBarraDoNavegador();
  try {
    localStorage.setItem("tema", escuroAgora ? "claro" : "escuro");
  } catch {
    // sem armazenamento (janela privada): vale até recarregar
  }
}

// O realce usa a CSS Custom Highlight API: marca o texto sem mexer no HTML. Sem ela
// (navegadores antigos), a busca funciona, só não acende.
type Realce = { set(nome: string, valor: unknown): void; delete(nome: string): void };

function registroDeRealces(): Realce | null {
  const css = globalThis.CSS as unknown as { highlights?: Realce } | undefined;
  return css?.highlights && "Highlight" in globalThis ? css.highlights : null;
}

export function realcar(nome: string, faixas: Range[]) {
  const registro = registroDeRealces();
  if (!registro) return;
  const Highlight = (globalThis as unknown as { Highlight: new (...r: Range[]) => unknown }).Highlight;
  if (faixas.length) registro.set(nome, new Highlight(...faixas));
  else registro.delete(nome);
}

// Cada ocorrência do termo no texto, sem diferenciar maiúsculas.
export function procurar(raiz: HTMLElement, termo: string) {
  const faixas: Range[] = [];
  const alvo = termo.toLocaleLowerCase();
  const andar = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
  for (let no = andar.nextNode(); no; no = andar.nextNode()) {
    const texto = (no.textContent ?? "").toLocaleLowerCase();
    let i = texto.indexOf(alvo);
    while (i !== -1) {
      const faixa = document.createRange();
      faixa.setStart(no, i);
      faixa.setEnd(no, i + alvo.length);
      faixas.push(faixa);
      i = texto.indexOf(alvo, i + alvo.length);
    }
  }
  return faixas;
}
