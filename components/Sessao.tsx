"use client";

import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent as TeclaDoReact,
  type ReactNode,
} from "react";
import { caminho, EMAIL, MANUAL, PAGINAS, SESSAO, type Bloco, type Idioma, type Slug } from "@/content/manual";
import estilos from "./manual.module.css";

type Modo = "less" | "busca" | "ajuda" | "prompt";
type Saida = { comando: string; linhas: ReactNode[] };

// "Thu Oct 22 09:14:07", o formato do macOS
function formatarLogin(data: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
      .formatToParts(data)
      .map((x) => [x.type, x.value]),
  );
  return `${p.weekday} ${p.month} ${p.day} ${p.hour}:${p.minute}:${p.second}`;
}

// O último acesso é lido e regravado uma vez por carregamento da página; navegar entre as
// páginas do manual não conta como um login novo.
let ultimoLogin: string | null = null;
function lerLogin() {
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
const semMudancas = () => () => {};

// A barra do navegador no celular segue o tema escolhido aqui, não só o do sistema.
function pintarBarraDoNavegador() {
  const fundo = getComputedStyle(document.documentElement).getPropertyValue("--fundo").trim();
  if (!fundo) return;
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.setAttribute("content", fundo));
}

// Os comandos já digitados no prompt, como o histórico de um shell: valem para a visita
// inteira, também depois de abrir outra página do manual.
const comandosAnteriores: string[] = [];

type Exemplo = Extract<Bloco, { tipo: "exemplo" }>;

// Os comandos da seção EXEMPLOS de todas as páginas: o prompt executa os mesmos.
function exemplosDe(idioma: Idioma): Exemplo[] {
  return Object.values(MANUAL[idioma]).flatMap((p) =>
    p.secoes.flatMap((secao) => secao.blocos.filter((b): b is Exemplo => b.tipo === "exemplo")),
  );
}

// O começo que todas as opções têm em comum: o que o Tab pode completar sem escolher.
function prefixoComum(opcoes: string[]) {
  return opcoes.reduce((prefixo, opcao) => {
    let i = 0;
    while (i < prefixo.length && prefixo[i] === opcao[i]) i++;
    return prefixo.slice(0, i);
  });
}

function trocarTema() {
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

type Realce = { set(nome: string, valor: unknown): void; delete(nome: string): void };
function registroDeRealces(): Realce | null {
  const css = globalThis.CSS as unknown as { highlights?: Realce } | undefined;
  return css?.highlights && "Highlight" in globalThis ? css.highlights : null;
}
function realcar(nome: string, faixas: Range[]) {
  const registro = registroDeRealces();
  if (!registro) return;
  const Highlight = (globalThis as unknown as { Highlight: new (...r: Range[]) => unknown }).Highlight;
  if (faixas.length) registro.set(nome, new Highlight(...faixas));
  else registro.delete(nome);
}

function procurar(raiz: HTMLElement, termo: string) {
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

// A tecla e o que ela faz, num botão só: no celular, é o jeito de usar o manual.
function Tecla({
  k,
  acao,
  rotulo,
  recolher,
  sempreComRotulo,
}: {
  k: string;
  acao: () => void;
  rotulo: string;
  recolher?: boolean;
  sempreComRotulo?: boolean;
}) {
  const classes = [estilos.tecla, recolher && estilos.recolhida].filter(Boolean).join(" ");
  return (
    <button type="button" className={classes} onClick={acao}>
      <b>{k}</b>
      <span className={sempreComRotulo ? undefined : estilos.rotuloDaTecla}> {rotulo}</span>
    </button>
  );
}

export default function Sessao({
  idioma,
  slug,
  curriculo,
  children,
}: {
  idioma: Idioma;
  slug: Slug;
  curriculo: { arquivo: string; url: string };
  children: ReactNode;
}) {
  const s = SESSAO[idioma];
  const outro: Idioma = idioma === "pt" ? "en" : "pt";
  const router = useRouter();

  const login = useSyncExternalStore(semMudancas, lerLogin, () => "");
  const [modo, setModo] = useState<Modo>("less");
  const [posicao, setPosicao] = useState({ porcento: 0, fim: false });
  const [termo, setTermo] = useState("");
  const [busca, setBusca] = useState<{ faixas: Range[]; atual: number } | null>(null);
  const [historico, setHistorico] = useState<Saida[]>([]);
  const [entrada, setEntrada] = useState("");
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const noHistorico = useRef<number | null>(null);
  const rascunho = useRef("");

  const entradaRef = useRef<HTMLInputElement>(null);
  const buscaRef = useRef<HTMLInputElement>(null);
  const fimDoPrompt = useRef<HTMLDivElement>(null);
  const painelDaAjuda = useRef<HTMLDivElement>(null);
  const barra = useRef<HTMLDivElement>(null);

  const alturaDaLinha = () => {
    const manual = document.getElementById("manual");
    return manual ? parseFloat(getComputedStyle(manual).lineHeight) || 24 : 24;
  };

  useEffect(pintarBarraDoNavegador, []);

  // A posição na barra do less acompanha a rolagem: no máximo uma medida por quadro, e a
  // barra só redesenha quando o número muda.
  useEffect(() => {
    let quadro = 0;
    const medir = () => {
      quadro = 0;
      const maximo = document.documentElement.scrollHeight - window.innerHeight;
      const fim = maximo <= 2 || window.scrollY >= maximo - 2;
      const porcento = maximo > 0 ? Math.round((window.scrollY / maximo) * 100) : 100;
      setPosicao((p) => (p.porcento === porcento && p.fim === fim ? p : { porcento, fim }));
    };
    const agendar = () => {
      if (!quadro) quadro = requestAnimationFrame(medir);
    };
    agendar();
    window.addEventListener("scroll", agendar, { passive: true });
    window.addEventListener("resize", agendar);
    return () => {
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", agendar);
      window.removeEventListener("resize", agendar);
    };
  }, []);

  // O resultado atual da busca fica realçado e na tela; muda com a busca, com n e com N.
  useEffect(() => {
    const faixa = busca?.faixas[busca.atual];
    realcar("busca-atual", faixa ? [faixa] : []);
    if (faixa) window.scrollTo({ top: window.scrollY + faixa.getBoundingClientRect().top - window.innerHeight / 3 });
  }, [busca]);

  const buscar = (e: FormEvent) => {
    e.preventDefault();
    const manual = document.getElementById("manual");
    // uma busca vazia apaga a anterior, como no less
    if (!manual || !termo.trim()) {
      realcar("busca", []);
      setBusca(null);
      setModo("less");
      return;
    }
    const faixas = procurar(manual, termo.trim());
    realcar("busca", faixas);
    setBusca({ faixas, atual: 0 });
    setModo("less");
  };

  const proximo = useCallback((passo: number) => {
    setBusca((b) => (b && b.faixas.length ? { ...b, atual: (b.atual + passo + b.faixas.length) % b.faixas.length } : b));
  }, []);

  // Um toque fora da ajuda a fecha: no celular não há q nem esc.
  useEffect(() => {
    if (modo !== "ajuda") return;
    const tocar = (e: PointerEvent) => {
      const alvo = e.target as Node;
      if (painelDaAjuda.current?.contains(alvo) || barra.current?.contains(alvo)) return;
      setModo("less");
    };
    document.addEventListener("pointerdown", tocar);
    return () => document.removeEventListener("pointerdown", tocar);
  }, [modo]);

  const abrirBusca = useCallback(() => {
    setTermo("");
    setModo("busca");
    window.setTimeout(() => buscaRef.current?.focus(), 0);
  }, []);

  const abrirPrompt = useCallback(() => {
    setModo("prompt");
    window.setTimeout(() => entradaRef.current?.focus(), 0);
  }, []);

  // As teclas do less.
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // O esc vale até com o cursor no prompt: é o jeito de voltar ao manual.
      if (e.key === "Escape" && modo === "prompt") {
        e.preventDefault();
        setModo("less");
        return;
      }
      const alvo = e.target instanceof Element ? e.target : document.body;
      if (alvo.closest("input, textarea, select, [contenteditable]")) return;
      const lh = alturaDaLinha();
      const janela = window.innerHeight - lh * 3;
      if (modo === "ajuda") {
        if (["q", "Q", "h", "H", "Escape"].includes(e.key)) {
          e.preventDefault();
          setModo("less");
        }
        return;
      }
      if (modo !== "less") {
        if (e.key === "Escape") setModo("less");
        return;
      }
      const acoes: Record<string, () => void> = {
        j: () => window.scrollBy({ top: lh }),
        ArrowDown: () => window.scrollBy({ top: lh }),
        Enter: () => window.scrollBy({ top: lh }),
        k: () => window.scrollBy({ top: -lh }),
        ArrowUp: () => window.scrollBy({ top: -lh }),
        " ": () => window.scrollBy({ top: janela }),
        f: () => window.scrollBy({ top: janela }),
        b: () => window.scrollBy({ top: -janela }),
        g: () => window.scrollTo({ top: 0 }),
        "<": () => window.scrollTo({ top: 0 }),
        G: () => window.scrollTo({ top: document.documentElement.scrollHeight }),
        ">": () => window.scrollTo({ top: document.documentElement.scrollHeight }),
        "/": abrirBusca,
        n: () => proximo(1),
        N: () => proximo(-1),
        t: trocarTema,
        l: () => router.push(caminho(outro, slug)),
        h: () => setModo("ajuda"),
        H: () => setModo("ajuda"),
        q: abrirPrompt,
        Q: abrirPrompt,
      };
      const acao = acoes[e.key];
      if (!acao) return;
      if (e.key === "Enter" && alvo.closest("a, button")) return;
      e.preventDefault();
      acao();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [modo, outro, slug, router, proximo, abrirBusca, abrirPrompt]);

  useEffect(() => {
    fimDoPrompt.current?.scrollIntoView({ block: "nearest" });
  }, [historico]);

  // Os comandos do prompt que aparece depois do q.
  const executar = (e: FormEvent) => {
    e.preventDefault();
    const comando = entrada.trim().replace(/\s+/g, " ");
    setEntrada("");
    setSugestoes([]);
    noHistorico.current = null;
    if (!comando) return;
    if (comandosAnteriores.at(-1) !== comando) comandosAnteriores.push(comando);
    const [nome, ...args] = comando.split(/\s+/);
    const responder = (...linhas: ReactNode[]) => setHistorico((h) => [...h, { comando, linhas }]);
    const paginas = PAGINAS as readonly string[];

    const abrirManual = (alvo: string) => {
      setHistorico([]);
      setModo("less");
      if (alvo === slug) window.scrollTo({ top: 0 });
      else router.push(caminho(idioma, alvo));
    };
    const abrir = (endereco: string) => {
      responder();
      if (/^https?:/.test(endereco)) window.open(endereco, "_blank", "noopener,noreferrer");
      else window.location.href = endereco;
    };

    switch (nome) {
      case "kayo": {
        const exemplo = exemplosDe(idioma).find((x) => x.comando === comando);
        if (exemplo?.abre) return abrir(exemplo.abre);
        if (exemplo) return responder(exemplo.texto);
        if (!args.length) return abrirManual("kayo");
        if (args[0] === "--curriculo" || args[0] === "--resume") return abrir(curriculo.url);
        if (args[0] === "--email") return abrir(`mailto:${EMAIL}`);
        if (paginas.includes(`kayo-${args[0]}`) && args.length === 1) return abrirManual(`kayo-${args[0]}`);
        return responder(s.usoDoKayo);
      }
      case "man": {
        const alvo = args[0];
        if (!alvo) return responder(s.qualPagina);
        if (!paginas.includes(alvo)) return responder(s.semManual(alvo));
        return abrirManual(alvo);
      }
      case "ls":
        return responder(
          <span className={estilos.ls}>
            {[...paginas.map((p) => `${p}.1`), curriculo.arquivo].map((p) => (
              <span key={p}>{p}</span>
            ))}
          </span>,
        );
      case "open":
      case "xdg-open":
        if (args[0] === curriculo.arquivo || args[0] === `~/${curriculo.arquivo}`) {
          responder();
          window.location.href = curriculo.url;
          return;
        }
        return responder(s.semArquivo(args[0] ?? ""));
      case "mail":
      case "email":
        responder();
        window.location.href = `mailto:${EMAIL}`;
        return;
      case "whoami":
        return responder("Kayo Kalinauskas");
      case "theme":
        trocarTema();
        return responder();
      case "lang":
        if (args[0] === "pt" || args[0] === "en") {
          router.push(caminho(args[0], slug));
          return responder();
        }
        return responder(s.usoDoLang);
      case "clear":
        setHistorico([]);
        return;
      case "help":
        return responder(
          ...s.ajudaPrompt.map(([c, d]) => (
            <span key={c} className={estilos.ajudaLinha}>
              <b>{c}</b>
              <span>{d}</span>
            </span>
          )),
        );
      case "exit":
      case "logout":
        setHistorico([]);
        setModo("less");
        return;
      default:
        return responder(s.naoEncontrado(nome));
    }
  };

  // Tudo o que o prompt entende, inteiro, para o Tab completar.
  const completaveis = [
    "help",
    "ls",
    "clear",
    "exit",
    "mail",
    "theme",
    "whoami",
    `open ${curriculo.arquivo}`,
    "lang pt",
    "lang en",
    ...PAGINAS.map((p) => `man ${p}`),
    "kayo",
    `kayo ${idioma === "pt" ? "--curriculo" : "--resume"}`,
    "kayo --email",
    ...PAGINAS.filter((p) => p !== "kayo").map((p) => `kayo ${p.slice("kayo-".length)}`),
    ...exemplosDe(idioma).map((x) => x.comando),
  ];

  // Tab completa, como no zsh; ↑ e ↓ andam pelos comandos anteriores.
  const teclaNoPrompt = (e: TeclaDoReact<HTMLInputElement>) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const opcoes = [...new Set(completaveis.filter((c) => c.startsWith(entrada) && c !== entrada.trimEnd()))];
      if (!opcoes.length) return;
      const comum = prefixoComum(opcoes);
      if (comum.length > entrada.length) {
        setEntrada(opcoes.length === 1 ? `${comum} ` : comum);
        setSugestoes([]);
      } else {
        // sem nada a completar sozinho, mostra as opções (só a palavra que muda)
        const inicio = entrada.lastIndexOf(" ") + 1;
        setSugestoes([...new Set(opcoes.map((o) => o.slice(inicio).split(" ")[0]))]);
      }
      return;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      if (!comandosAnteriores.length) return;
      e.preventDefault();
      if (noHistorico.current === null) {
        if (e.key === "ArrowDown") return;
        rascunho.current = entrada;
        noHistorico.current = comandosAnteriores.length;
      }
      const proximo = noHistorico.current + (e.key === "ArrowUp" ? -1 : 1);
      if (proximo >= comandosAnteriores.length) {
        noHistorico.current = null;
        setEntrada(rascunho.current);
      } else {
        noHistorico.current = Math.max(0, proximo);
        setEntrada(comandosAnteriores[noHistorico.current]);
      }
      setSugestoes([]);
    }
  };

  const buscando = !!busca && busca.faixas.length > 1;

  // "4 resultados (1/4)"; no celular sobra só o "1/4", para a barra caber
  const resultadoDaBusca = busca ? (
    busca.faixas.length ? (
      <>
        <span className={estilos.contagem}>{s.resultados(busca.faixas.length)} </span>
        <span className={estilos.contagem}>(</span>
        {busca.atual + 1}/{busca.faixas.length}
        <span className={estilos.contagem}>)</span>
      </>
    ) : (
      s.semResultados
    )
  ) : null;

  return (
    <div className={estilos.sessao}>
      <a href="#manual" className={estilos.pular}>
        {s.pularParaOConteudo}
      </a>

      <div className={estilos.topo} aria-hidden="true">
        <p className={estilos.suave}>
          Last login: <span className={estilos.login}>{login}</span> on ttys001
        </p>
        <p>
          <span className={estilos.usuario}>kayo@kalinauskas</span> <span className={estilos.diretorio}>~</span> % man {slug}
        </p>
      </div>

      <main>{children}</main>

      {modo === "ajuda" && (
        <div ref={painelDaAjuda} className={estilos.painel} role="dialog" aria-label={s.ajuda.titulo}>
          <p className={estilos.ajudaTitulo}>{s.ajuda.titulo}</p>
          {s.ajuda.linhas.map(([k, d]) => (
            <p key={k} className={estilos.ajudaLinha}>
              <b>{k}</b>
              <span>{d}</span>
            </p>
          ))}
          <p className={estilos.suave}>{s.ajuda.rodape}</p>
        </div>
      )}

      {modo === "prompt" && (
        <div className={estilos.painel} role="region" aria-label="shell">
          {historico.map((saida, i) => (
            <div key={i}>
              <p>
                <span className={estilos.usuario}>kayo@kalinauskas</span> <span className={estilos.diretorio}>~</span> %{" "}
                {saida.comando}
              </p>
              {saida.linhas.map((linha, j) => (
                <p key={j}>{linha}</p>
              ))}
            </div>
          ))}
          {historico.length === 0 && (
            <p className={estilos.suave}>
              {idioma === "pt"
                ? "Digite help para ver os comandos, ou man kayo para voltar."
                : "Type help to see the commands, or man kayo to go back."}
            </p>
          )}
          {sugestoes.length > 0 && (
            <p className={estilos.ls}>
              {sugestoes.map((o) => (
                <span key={o}>{o}</span>
              ))}
            </p>
          )}
          <form onSubmit={executar} className={estilos.linhaDoPrompt}>
            <label htmlFor="shell">
              <span className={estilos.usuario}>kayo@kalinauskas</span> <span className={estilos.diretorio}>~</span> %
            </label>
            <input
              id="shell"
              ref={entradaRef}
              value={entrada}
              onChange={(e) => {
                setEntrada(e.target.value);
                setSugestoes([]);
              }}
              onKeyDown={teclaNoPrompt}
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </form>
          <div ref={fimDoPrompt} />
        </div>
      )}

      <div ref={barra} className={estilos.less}>
        {modo === "busca" ? (
          <form onSubmit={buscar} className={estilos.busca}>
            <label htmlFor="busca">/</label>
            <input
              id="busca"
              ref={buscaRef}
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              onBlur={() => setModo("less")}
              aria-label={s.padrao}
              autoComplete="off"
              spellCheck={false}
            />
          </form>
        ) : modo === "prompt" ? (
          <p className={estilos.lessTexto}>
            <span className={estilos.posicao}>zsh</span>
            <span className={estilos.teclas}>
              <Tecla k="esc" acao={() => setModo("less")} rotulo={s.teclas.voltar} sempreComRotulo />
            </span>
          </p>
        ) : (
          <p className={estilos.lessTexto}>
            <span className={estilos.posicao}>
              <span className={estilos.nomeDaPagina}>{slug}(1) </span>
              <span className={busca ? estilos.porcentoNaBusca : undefined}>
                {posicao.fim ? `(${s.fim})` : `${posicao.porcento}%`}{" "}
              </span>
              <span className={estilos.resultado} aria-live="polite">
                {resultadoDaBusca}
              </span>
            </span>
            <span className={estilos.teclas}>
              <Tecla k="h" acao={() => setModo((m) => (m === "ajuda" ? "less" : "ajuda"))} rotulo={s.teclas.ajuda} />
              <Tecla k="/" acao={abrirBusca} rotulo={s.teclas.buscar} />
              {buscando && (
                <>
                  <Tecla k="n" acao={() => proximo(1)} rotulo={s.teclas.proximo} />
                  <Tecla k="N" acao={() => proximo(-1)} rotulo={s.teclas.anterior} />
                </>
              )}
              <Tecla k="t" acao={trocarTema} rotulo={s.teclas.tema} recolher={buscando} />
              <Tecla k="l" acao={() => router.push(caminho(outro, slug))} rotulo={s.teclas.idioma} recolher={buscando} />
              <Tecla k="q" acao={abrirPrompt} rotulo={s.teclas.sair} />
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
