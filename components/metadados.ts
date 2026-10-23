import type { Metadata, Viewport } from "next";
import { caminho, MANUAL, type Idioma, type Slug } from "@/content/manual";

export const SITE = "https://kalinauskas.dev";

// No celular: a barra do navegador na cor do fundo de cada tema, e o teclado virtual
// encolhe a página (no Android), para a barra do less e o campo de busca ficarem à vista.
export const VIEWPORT: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf6e3" },
    { media: "(prefers-color-scheme: dark)", color: "#1d1f21" },
  ],
};

export function metadados(idioma: Idioma, slug: Slug): Metadata {
  const p = MANUAL[idioma][slug];
  const aqui = caminho(idioma, slug);
  return {
    metadataBase: new URL(SITE),
    title: p.titulo,
    description: p.descricao,
    alternates: {
      canonical: aqui,
      languages: { "pt-BR": caminho("pt", slug), en: caminho("en", slug), "x-default": caminho("pt", slug) },
    },
    openGraph: {
      type: "website",
      url: aqui,
      title: p.titulo,
      description: p.descricao,
      siteName: "kalinauskas.dev",
      locale: idioma === "pt" ? "pt_BR" : "en_US",
    },
    twitter: { card: "summary_large_image", title: p.titulo, description: p.descricao },
  };
}
