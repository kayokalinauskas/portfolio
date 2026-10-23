import type { Metadata } from "next";
import { caminho, MANUAL, type Idioma, type Slug } from "@/content/manual";

export const SITE = "https://kalinauskas.dev";

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
