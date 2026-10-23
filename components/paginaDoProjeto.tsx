import { notFound } from "next/navigation";
import Manual from "./Manual";
import { metadados } from "./metadados";
import { PAGINAS, type Idioma, type Slug } from "@/content/manual";

// As páginas dos subcomandos (kayo-ozamigos(1) e as outras), iguais nas duas línguas.
type Params = { params: Promise<{ pagina: string }> };

const SUBPAGINAS = PAGINAS.filter((p) => p !== "kayo");

export function paginasEstaticas() {
  return SUBPAGINAS.map((pagina) => ({ pagina }));
}

export function validar(pagina: string): Slug {
  if (!(SUBPAGINAS as readonly string[]).includes(pagina)) notFound();
  return pagina as Slug;
}

export function metadadosDoProjeto(idioma: Idioma) {
  return async ({ params }: Params) => metadados(idioma, validar((await params).pagina));
}

export function paginaDoProjeto(idioma: Idioma) {
  return async function Pagina({ params }: Params) {
    return <Manual idioma={idioma} slug={validar((await params).pagina)} />;
  };
}
