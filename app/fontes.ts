import { IBM_Plex_Mono } from "next/font/google";

// Uma família só, como num terminal: a hierarquia vem do negrito, não do tamanho.
const mono = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--fonte-mono",
  display: "swap",
  // Enquanto a Plex carrega, entra uma mono do sistema com a mesma largura de caractere
  // (0,6 em, definida em globals.css). O fallback automático do next/font é uma Arial
  // ajustada: proporcional, ela mudava a largura do ch e as linhas pulavam (CLS).
  adjustFontFallback: false,
  fallback: ["Plex Mono Fallback", "ui-monospace", "monospace"],
});

export const classesDasFontes = mono.variable;
