"use client";

import { usePathname } from "next/navigation";
import estilos from "./manual.module.css";

// Um endereço malformado (/%E0) faria o decodeURIComponent lançar e derrubar o próprio 404.
function decodificar(texto: string) {
  try {
    return decodeURIComponent(texto);
  } catch {
    return texto;
  }
}

// O 404 é o que o terminal responde a um man de página que não existe.
export default function SemManual() {
  const caminho = usePathname() ?? "/";
  const ingles = caminho === "/en" || caminho.startsWith("/en/");
  const pagina = decodificar(caminho.replace(/^\/(en\/)?/, "").replace(/\/$/, "")) || "?";

  return (
    <main className={estilos.sessao}>
      <p>
        <span className={estilos.usuario}>kayo@kalinauskas</span> <span className={estilos.diretorio}>~</span> % man {pagina}
      </p>
      <p>{ingles ? `No manual entry for ${pagina}` : `Nenhuma entrada de manual para ${pagina}`}</p>
      <p>
        <span className={estilos.usuario}>kayo@kalinauskas</span> <span className={estilos.diretorio}>~</span> %{" "}
        <a href={ingles ? "/en" : "/"}>man kayo</a>
        <span className={estilos.cursor} />
      </p>
    </main>
  );
}
