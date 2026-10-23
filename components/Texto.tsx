import Link from "next/link";
import type { ReactNode } from "react";
import { caminho, PAGINAS, type Idioma } from "@/content/manual";

// Lê a marcação dos textos de content/manual.ts (a lista está no topo daquele arquivo).
// O texto de um link não tem colchetes, para "[[--web](...)]" virar um link entre [ ].
const MARCACAO = /\*\*(.+?)\*\*|~(.+?)~|\[([^[\]]+)\]\((.+?)\)|@\{(.+?)\}|\{([a-z0-9-]+)\((\d)\)\}/g;

function linkExterno(href: string, texto: string, chave: number) {
  // uma página do site navega sem recarregar; o PDF e os endereços de fora, não
  if (href.startsWith("/") && !href.endsWith(".pdf")) {
    return (
      <Link key={chave} href={href}>
        {texto}
      </Link>
    );
  }
  const externo = /^https?:/.test(href);
  return (
    <a key={chave} href={href} {...(externo ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {texto}
    </a>
  );
}

export function Texto({ texto, idioma }: { texto: string; idioma: Idioma }) {
  const partes: ReactNode[] = [];
  let ultimo = 0;
  let chave = 0;
  for (const m of texto.matchAll(MARCACAO)) {
    if (m.index > ultimo) partes.push(texto.slice(ultimo, m.index));
    const [, negrito, sublinhado, rotulo, href, angular, pagina, secao] = m;
    if (negrito) partes.push(<b key={chave++}>{negrito}</b>);
    else if (sublinhado) partes.push(<u key={chave++}>{sublinhado}</u>);
    else if (rotulo && href) partes.push(linkExterno(href, rotulo, chave++));
    else if (angular) {
      const [url, mostrar] = angular.split("|");
      partes.push("<", linkExterno(url, mostrar ?? url.replace(/^mailto:/, ""), chave++), ">");
    } else if (pagina) {
      // uma página deste manual vira link; as das ferramentas (java(1), git(1)) ficam como no terminal
      const existe = (PAGINAS as readonly string[]).includes(pagina);
      partes.push(
        existe ? (
          <Link key={chave++} href={caminho(idioma, pagina)}>
            <b>{pagina}</b>({secao})
          </Link>
        ) : (
          <span key={chave++}>
            <b>{pagina}</b>({secao})
          </span>
        ),
      );
    }
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return <>{partes}</>;
}

// O texto sem a marcação, para medir o rótulo de um item.
export function semMarcacao(texto: string) {
  return texto.replace(MARCACAO, (_t, n, s, r, _h, a, p, sec) => n ?? s ?? r ?? (a ? `<${a.split("|").pop()}>` : `${p}(${sec})`));
}
