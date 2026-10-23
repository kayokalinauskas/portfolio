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
import { caminho, SESSAO, type Idioma, type Slug } from "@/content/manual";
import estilos from "./manual.module.css";
import { lerLogin, pintarBarraDoNavegador, procurar, realcar, semMudancas, trocarTema } from "./sessao/navegador";
import {
  andarNoHistorico,
  completar,
  completaveis,
  historico as historicoDaVisita,
  interpretar,
  lembrar,
  type Linha,
  type NoHistorico,
} from "./sessao/shell";
import Tecla from "./sessao/Tecla";

// A sessão de terminal em volta do manual: o login, a barra do less com as teclas, a
// busca, a ajuda e o prompt do q. O que o prompt entende fica em sessao/shell.ts.

type Modo = "less" | "busca" | "ajuda" | "prompt";
type Saida = { comando: string; linhas: Linha[] };

function LinhaDaSaida({ linha }: { linha: Linha }) {
  if (typeof linha === "string") return <p>{linha}</p>;
  if ("preservado" in linha) return <p className={estilos.preservado}>{linha.preservado}</p>;
  if ("lista" in linha) {
    return (
      <p className={estilos.ls}>
        {linha.lista.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </p>
    );
  }
  return (
    <>
      {linha.tabela.map(([c, d]) => (
        <p key={c} className={estilos.ajudaLinha}>
          <b>{c}</b>
          <span>{d}</span>
        </p>
      ))}
    </>
  );
}

const Prompt = () => (
  <>
    <span className={estilos.usuario}>kayo@kalinauskas</span> <span className={estilos.diretorio}>~</span> %
  </>
);

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
  const [saidas, setSaidas] = useState<Saida[]>([]);
  const [entrada, setEntrada] = useState("");
  const [sugestoes, setSugestoes] = useState<string[]>([]);
  const noHistorico = useRef<NoHistorico>({ posicao: null, rascunho: "" });

  const entradaRef = useRef<HTMLInputElement>(null);
  const buscaRef = useRef<HTMLInputElement>(null);
  const fimDoPrompt = useRef<HTMLDivElement>(null);
  const painelDaAjuda = useRef<HTMLDivElement>(null);
  const barra = useRef<HTMLDivElement>(null);

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

  // A busca acende a cada letra, como o less com busca incremental; o Enter só confirma.
  const pesquisar = (texto: string) => {
    setTermo(texto);
    const manual = document.getElementById("manual");
    // uma busca vazia apaga a anterior, como no less
    if (!manual || !texto.trim()) {
      realcar("busca", []);
      setBusca(null);
      return;
    }
    const faixas = procurar(manual, texto.trim());
    realcar("busca", faixas);
    setBusca({ faixas, atual: 0 });
  };

  const buscar = (e: FormEvent) => {
    e.preventDefault();
    setModo("less");
  };

  // O esc desiste da busca: apaga o realce e volta a ler.
  const teclaNaBusca = (e: TeclaDoReact<HTMLInputElement>) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    pesquisar("");
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
    const alturaDaLinha = () => {
      const manual = document.getElementById("manual");
      return manual ? parseFloat(getComputedStyle(manual).lineHeight) || 24 : 24;
    };
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
  }, [saidas]);

  // O Enter no prompt: o shell responde, e aqui a resposta vira tela e ação.
  const executar = (e: FormEvent) => {
    e.preventDefault();
    const comando = entrada.trim().replace(/\s+/g, " ");
    setEntrada("");
    setSugestoes([]);
    noHistorico.current = { posicao: null, rascunho: "" };
    if (!comando) return;
    const { linhas, efeito } = interpretar(comando, {
      idioma,
      curriculo,
      historico: lembrar(comando),
      agora: new Date(),
    });

    switch (efeito?.tipo) {
      case "manual":
        setSaidas([]);
        setModo("less");
        if (efeito.pagina === slug) window.scrollTo({ top: 0 });
        else router.push(caminho(idioma, efeito.pagina));
        return;
      case "limpar":
        setSaidas([]);
        return;
      case "sair":
        setSaidas([]);
        setModo("less");
        return;
    }
    setSaidas((h) => [...h, { comando, linhas }]);
    if (efeito?.tipo === "tema") trocarTema();
    if (efeito?.tipo === "idioma") router.push(caminho(efeito.idioma, slug));
    if (efeito?.tipo === "abrir") {
      if (/^https?:/.test(efeito.endereco)) window.open(efeito.endereco, "_blank", "noopener,noreferrer");
      else window.location.href = efeito.endereco;
    }
  };

  // Tab completa, como no zsh; ↑ e ↓ andam pelos comandos anteriores.
  const teclaNoPrompt = (e: TeclaDoReact<HTMLInputElement>) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const resultado = completar(entrada, completaveis(idioma, curriculo.arquivo));
      if (resultado && "entrada" in resultado) {
        setEntrada(resultado.entrada);
        setSugestoes([]);
      } else if (resultado) {
        setSugestoes(resultado.sugestoes);
      }
      return;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      const passo = andarNoHistorico(historicoDaVisita(), noHistorico.current, e.key === "ArrowUp" ? -1 : 1, entrada);
      if (!passo) return;
      e.preventDefault();
      noHistorico.current = passo.estado;
      setEntrada(passo.entrada);
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
          <Prompt /> man {slug}
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
          {saidas.map((saida, i) => (
            <div key={i}>
              <p>
                <Prompt /> {saida.comando}
              </p>
              {saida.linhas.map((linha, j) => (
                <LinhaDaSaida key={j} linha={linha} />
              ))}
            </div>
          ))}
          {saidas.length === 0 && <p className={estilos.suave}>{s.dicaDoPrompt}</p>}
          {sugestoes.length > 0 && <LinhaDaSaida linha={{ lista: sugestoes }} />}
          <form onSubmit={executar} className={estilos.linhaDoPrompt}>
            <label htmlFor="shell">
              <Prompt />
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
              onChange={(e) => pesquisar(e.target.value)}
              onKeyDown={teclaNaBusca}
              onBlur={() => setModo("less")}
              aria-label={s.padrao}
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
            />
            <span className={estilos.resultado} aria-live="polite">
              {termo.trim() && (busca?.faixas.length ? `${busca.atual + 1}/${busca.faixas.length}` : s.semResultados)}
            </span>
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
