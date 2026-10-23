import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { classesDasFontes } from "@/app/fontes";
import "@/app/globals.css";

// Antes da primeira pintura: aplica o tema guardado (sem piscar no tema errado) e marca a
// digitação de "man kayo", só na primeira página da visita, só para quem aceita animação e
// nunca para robôs de busca (para eles, o texto não fica escondido nem por um instante).
const antesDePintar = `try{var r=document.documentElement,t=localStorage.getItem("tema");if(t==="claro"||t==="escuro")r.dataset.theme=t==="claro"?"light":"dark";if(!sessionStorage.getItem("intro")&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&!/bot|crawl|spider|slurp|facebookexternalhit|embedly|preview/i.test(navigator.userAgent))r.dataset.intro="1"}catch(e){}`;

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
