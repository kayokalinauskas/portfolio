import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { classesDasFontes } from "@/app/fontes";
import "@/app/globals.css";

// Antes da primeira pintura: aplica o tema guardado, sem piscar no tema errado.
const antesDePintar = `try{var t=localStorage.getItem("tema");if(t==="claro"||t==="escuro")document.documentElement.dataset.theme=t==="claro"?"light":"dark"}catch(e){}`;

export default function Documento({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <html lang={lang} className={classesDasFontes} suppressHydrationWarning>
      {/* o layout raiz do App Router monta o <head>; a regra é do roteador antigo */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: antesDePintar }} />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
