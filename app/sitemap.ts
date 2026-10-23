import type { MetadataRoute } from "next";
import { SITE } from "@/components/metadados";
import { caminho, PAGINAS } from "@/content/manual";

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGINAS.flatMap((slug) => {
    const idiomas = { languages: { "pt-BR": SITE + caminho("pt", slug), en: SITE + caminho("en", slug) } };
    return (["pt", "en"] as const).map((idioma) => ({
      url: SITE + (caminho(idioma, slug) === "/" ? "" : caminho(idioma, slug)),
      alternates: idiomas,
    }));
  });
}
