import type { MetadataRoute } from "next";
import { SITE } from "@/components/metadados";
import { caminho, PAGINAS } from "@/content/manual";

// O mesmo endereço do canonical de cada página: a raiz sem a barra no fim.
const endereco = (idioma: "pt" | "en", slug: string) => {
  const c = caminho(idioma, slug);
  return SITE + (c === "/" ? "" : c);
};

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGINAS.flatMap((slug) => {
    const alternates = {
      languages: { "pt-BR": endereco("pt", slug), en: endereco("en", slug), "x-default": endereco("pt", slug) },
    };
    return (["pt", "en"] as const).map((idioma) => ({ url: endereco(idioma, slug), alternates }));
  });
}
