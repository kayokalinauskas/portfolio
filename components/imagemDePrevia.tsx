import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { MANUAL, SESSAO, type Idioma, type Slug } from "@/content/manual";
import { semMarcacao } from "./Texto";

// A prévia ao colar o link no LinkedIn ou no WhatsApp: o topo da página de manual, uma por página.
export const tamanhoDaPrevia = { width: 1200, height: 630 };

const regular = readFile(join(process.cwd(), "assets/fontes/plex-mono-400.ttf"));
const negrito = readFile(join(process.cwd(), "assets/fontes/plex-mono-600.ttf"));

// As primeiras frases do texto, até caberem em quatro linhas da imagem.
function resumir(texto: string, limite = 180) {
  const frases = texto.split(/(?<=\.) /);
  let resumo = frases[0];
  for (const frase of frases.slice(1)) {
    if ((resumo + " " + frase).length > limite) break;
    resumo += " " + frase;
  }
  return resumo;
}

export async function imagemDePrevia(idioma: Idioma, slug: Slug = "kayo") {
  const p = MANUAL[idioma][slug];
  const nome = p.secoes[0];
  const descricao = p.secoes[2];
  const linhaDoNome = nome.blocos[0].tipo === "texto" ? semMarcacao(nome.blocos[0].texto) : slug;
  const [comando, ...resto] = linhaDoNome.split(" - ");
  const resumo = descricao.blocos[0].tipo === "texto" ? resumir(semMarcacao(descricao.blocos[0].texto)) : "";
  const pagina = `${slug.toUpperCase()}(1)`;
  const t = SESSAO[idioma].teclas;
  const teclas = `h ${t.ajuda}  / ${t.buscar}  t ${t.tema}  l ${t.idioma}  q ${t.sair}`;
  const fundo = "#fdf6e3";
  const texto = "#586e75";
  const forte = "#073642";

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "64px 80px",
        background: fundo,
        color: texto,
        fontFamily: "Plex",
        fontSize: 30,
        lineHeight: 1.55,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{pagina}</span>
        <span>{SESSAO[idioma].colecao}</span>
        <span>{pagina}</span>
      </div>
      <div style={{ display: "flex", marginTop: 46, fontWeight: 600, color: forte }}>{nome.titulo}</div>
      {/* o nome e a descrição lado a lado; uma descrição longa quebra na própria coluna */}
      <div style={{ display: "flex", marginLeft: 105 }}>
        <span style={{ fontWeight: 600, color: forte, flexShrink: 0 }}>{comando}</span>
        <span style={{ flex: 1 }}>&nbsp;- {resto.join(" - ")}</span>
      </div>
      <div style={{ display: "flex", marginTop: 30, fontWeight: 600, color: forte }}>{descricao.titulo}</div>
      <div style={{ display: "flex", marginLeft: 105, fontSize: 26 }}>{resumo}</div>
      {/* a barra do less, como na página: a posição à esquerda e as teclas à direita */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "auto",
          background: texto,
          color: fundo,
          padding: "0 14px",
          fontSize: 24,
        }}
      >
        <span>{slug}(1) 0%</span>
        <span>{teclas}</span>
      </div>
    </div>,
    {
      ...tamanhoDaPrevia,
      fonts: [
        { name: "Plex", data: await regular, style: "normal", weight: 400 },
        { name: "Plex", data: await negrito, style: "normal", weight: 600 },
      ],
    },
  );
}
