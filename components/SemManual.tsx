"use client";

import { useEffect, useState } from "react";
import estilos from "./manual.module.css";

// O 404 é o que o terminal responde a um man de página que não existe.
export default function SemManual() {
  const [pagina, setPagina] = useState("");
  const [ingles, setIngles] = useState(false);
  useEffect(() => {
    const caminho = window.location.pathname;
    setIngles(caminho === "/en" || caminho.startsWith("/en/"));
    setPagina(decodeURIComponent(caminho.replace(/^\/(en\/)?/, "").replace(/\/$/, "")) || "?");
  }, []);

  return (
    <main className={estilos.sessao}>
      <p>
        <span className={estilos.usuario}>kayo@kalinauskas</span> <span className={estilos.diretorio}>~</span> % man{" "}
        {pagina}
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
