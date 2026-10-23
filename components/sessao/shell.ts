// O shell do prompt que abre com o q, sem React e sem DOM: recebe o comando e diz o que
// mostrar e o que fazer. A Sessao aplica a resposta; os testes conferem as respostas.

import { EMAIL, MANUAL, PAGINAS, PROJETOS, SESSAO, type Bloco, type Idioma, type Slug } from "@/content/manual";
import { formatarData, formatarUptime } from "./formatos";

// Uma linha da saída: texto, uma lista em colunas (ls), uma tabela (help) ou um texto que
// mantém os espaços (history, uptime).
export type Linha = string | { lista: string[] } | { tabela: [string, string][] } | { preservado: string };

// O que o comando faz além de escrever: abrir uma página do manual (fecha o prompt), um
// endereço, trocar o tema ou a língua, limpar a tela ou sair.
export type Efeito =
  | { tipo: "manual"; pagina: Slug }
  | { tipo: "abrir"; endereco: string }
  | { tipo: "tema" }
  | { tipo: "idioma"; idioma: Idioma }
  | { tipo: "limpar" }
  | { tipo: "sair" };

export type Resposta = { linhas: Linha[]; efeito?: Efeito };

export type Contexto = {
  idioma: Idioma;
  curriculo: { arquivo: string; url: string };
  historico: readonly string[];
  agora: Date;
};

type Exemplo = Extract<Bloco, { tipo: "exemplo" }>;

// Os comandos da seção EXEMPLOS de todas as páginas: o prompt executa os mesmos.
export function exemplosDe(idioma: Idioma): Exemplo[] {
  return Object.values(MANUAL[idioma]).flatMap((p) =>
    p.secoes.flatMap((secao) => secao.blocos.filter((b): b is Exemplo => b.tipo === "exemplo")),
  );
}

const ehPagina = (nome: string): nome is Slug => (PAGINAS as readonly string[]).includes(nome);

const so = (...linhas: Linha[]): Resposta => ({ linhas });
const fazer = (efeito: Efeito): Resposta => ({ linhas: [], efeito });

export function interpretar(entrada: string, ctx: Contexto): Resposta {
  const s = SESSAO[ctx.idioma];
  const comando = entrada.trim().replace(/\s+/g, " ");
  const [nome, ...args] = comando.split(" ");

  switch (nome) {
    case "kayo": {
      const exemplo = exemplosDe(ctx.idioma).find((x) => x.comando === comando);
      if (exemplo?.abre) return fazer({ tipo: "abrir", endereco: exemplo.abre });
      if (exemplo) return so(exemplo.texto);
      if (!args.length) return fazer({ tipo: "manual", pagina: "kayo" });
      if (args[0] === "--curriculo" || args[0] === "--resume") return fazer({ tipo: "abrir", endereco: ctx.curriculo.url });
      if (args[0] === "--email") return fazer({ tipo: "abrir", endereco: `mailto:${EMAIL}` });
      const pagina = `kayo-${args[0]}`;
      if (args.length === 1 && ehPagina(pagina)) return fazer({ tipo: "manual", pagina });
      return so(s.usoDoKayo);
    }
    case "man":
      if (!args[0]) return so(s.qualPagina);
      return ehPagina(args[0]) ? fazer({ tipo: "manual", pagina: args[0] }) : so(s.semManual(args[0]));
    case "ls":
      return so({ lista: [...PAGINAS.map((p) => `${p}.1`), ctx.curriculo.arquivo] });
    case "open":
    case "xdg-open":
      if (args[0] === ctx.curriculo.arquivo || args[0] === `~/${ctx.curriculo.arquivo}`) {
        return fazer({ tipo: "abrir", endereco: ctx.curriculo.url });
      }
      return so(s.semArquivo(args[0] ?? ""));
    case "mail":
    case "email":
      return fazer({ tipo: "abrir", endereco: `mailto:${EMAIL}` });
    case "whoami":
      return so("Kayo Kalinauskas");
    case "pwd":
      return so("/Users/kayo");
    case "date":
      return so(formatarData(ctx.agora));
    case "uptime":
      return so({ preservado: formatarUptime(ctx.agora) });
    case "history":
      return so(...ctx.historico.map((c, i) => ({ preservado: `${String(i + 1).padStart(5)}  ${c}` })));
    case "sudo":
      // a resposta de verdade do sudo para quem não está no sudoers
      return so("kayo is not in the sudoers file. This incident will be reported.");
    case "theme":
      return fazer({ tipo: "tema" });
    case "lang":
      return args[0] === "pt" || args[0] === "en" ? fazer({ tipo: "idioma", idioma: args[0] }) : so(s.usoDoLang);
    case "clear":
      return fazer({ tipo: "limpar" });
    case "help":
      return so({ tabela: s.ajudaPrompt });
    case "exit":
    case "logout":
      return fazer({ tipo: "sair" });
    default:
      return so(s.naoEncontrado(nome));
  }
}

// Tudo o que o prompt entende, inteiro, para o Tab completar. O sudo fica de fora: é para
// quem tentar.
export function completaveis(idioma: Idioma, arquivoDoCurriculo: string) {
  return [
    ...new Set([
      "help",
      "ls",
      "clear",
      "exit",
      "mail",
      "theme",
      "whoami",
      "pwd",
      "date",
      "uptime",
      "history",
      `open ${arquivoDoCurriculo}`,
      "lang pt",
      "lang en",
      ...PAGINAS.map((p) => `man ${p}`),
      "kayo",
      `kayo ${idioma === "pt" ? "--curriculo" : "--resume"}`,
      "kayo --email",
      ...PROJETOS.map((p) => `kayo ${p.slice("kayo-".length)}`),
      ...exemplosDe(idioma).map((x) => x.comando),
    ]),
  ];
}

// O começo que todas as opções têm em comum: o que o Tab pode completar sem escolher.
export function prefixoComum(opcoes: string[]) {
  return opcoes.reduce((prefixo, opcao) => {
    let i = 0;
    while (i < prefixo.length && prefixo[i] === opcao[i]) i++;
    return prefixo.slice(0, i);
  });
}

// O Tab, como no zsh: completa o que é comum a todas as opções (com um espaço no fim, se
// sobrar uma só); sem nada a completar, lista as opções, só a palavra que muda.
export function completar(entrada: string, opcoes: string[]): { entrada: string } | { sugestoes: string[] } | null {
  const cabem = opcoes.filter((c) => c.startsWith(entrada) && c !== entrada.trimEnd());
  if (!cabem.length) return null;
  const comum = prefixoComum(cabem);
  if (comum.length > entrada.length) return { entrada: cabem.length === 1 ? `${comum} ` : comum };
  const inicio = entrada.lastIndexOf(" ") + 1;
  return { sugestoes: [...new Set(cabem.map((o) => o.slice(inicio).split(" ")[0]))] };
}

// ↑ e ↓ pelos comandos anteriores. "posicao" é null enquanto se digita um comando novo; o
// rascunho é o que estava no campo antes do primeiro ↑, e volta depois do último ↓.
export type NoHistorico = { posicao: number | null; rascunho: string };

export function andarNoHistorico(
  historico: readonly string[],
  estado: NoHistorico,
  direcao: -1 | 1,
  entrada: string,
): { estado: NoHistorico; entrada: string } | null {
  if (!historico.length) return null;
  let { posicao, rascunho } = estado;
  if (posicao === null) {
    if (direcao === 1) return null;
    rascunho = entrada;
    posicao = historico.length;
  }
  const proxima = posicao + direcao;
  if (proxima >= historico.length) return { estado: { posicao: null, rascunho }, entrada: rascunho };
  const nova = Math.max(0, proxima);
  return { estado: { posicao: nova, rascunho }, entrada: historico[nova] };
}

// O histórico da visita, como o de um shell: vale também depois de abrir outra página.
const historicoDaVisita: string[] = [];

export function lembrar(comando: string) {
  const limpo = comando.trim().replace(/\s+/g, " ");
  if (limpo && historicoDaVisita.at(-1) !== limpo) historicoDaVisita.push(limpo);
  return historicoDaVisita;
}

export const historico = (): readonly string[] => historicoDaVisita;
