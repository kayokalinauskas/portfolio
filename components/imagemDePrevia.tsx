import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { MANUAL, SESSAO, type Idioma } from "@/content/manual";

// A prévia ao colar o link no LinkedIn ou no WhatsApp: o topo da página de manual.
export const tamanhoDaPrevia = { width: 1200, height: 630 };

const regular = readFile(join(process.cwd(), "assets/fontes/plex-mono-400.ttf"));
const negrito = readFile(join(process.cwd(), "assets/fontes/plex-mono-600.ttf"));

export async function imagemDePrevia(idioma: Idioma) {
  const p = MANUAL[idioma].kayo;
  const nome = p.secoes[0];
  const descricao = p.secoes[2];
  const resumo = descricao.blocos[0].tipo === "texto" ? descricao.blocos[0].texto : "";
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
        <span>KAYO(1)</span>
        <span>{SESSAO[idioma].colecao}</span>
        <span>KAYO(1)</span>
      </div>
      <div style={{ display: "flex", marginTop: 46, fontWeight: 600, color: forte }}>{nome.titulo}</div>
      <div style={{ display: "flex", marginLeft: 105 }}>
        <span style={{ fontWeight: 600, color: forte }}>kayo</span>
        <span>&nbsp;- Kayo Kalinauskas, {idioma === "pt" ? "desenvolvedor full stack" : "full stack developer"}</span>
      </div>
      <div style={{ display: "flex", marginTop: 30, fontWeight: 600, color: forte }}>{descricao.titulo}</div>
      <div style={{ display: "flex", marginLeft: 105, fontSize: 26 }}>{resumo.split(".")[0]}.</div>
      <div
        style={{
          display: "flex",
          marginTop: "auto",
          background: texto,
          color: fundo,
          padding: "0 14px",
          fontSize: 26,
        }}
      >
        Manual page kayo(1) line 1 (press h for help or q to quit)
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
