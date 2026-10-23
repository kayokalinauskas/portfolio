import { IBM_Plex_Mono } from "next/font/google";

// Uma família só, como num terminal: a hierarquia vem do negrito, não do tamanho.
const mono = IBM_Plex_Mono({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--fonte-mono",
  display: "swap",
});

export const classesDasFontes = mono.variable;
