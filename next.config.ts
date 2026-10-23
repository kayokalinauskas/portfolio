import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // com um layout por idioma, o 404 do site todo precisa do global-not-found
  // o CSS do site tem ~5 KB: em linha no HTML, ele não segura a primeira pintura
  experimental: { globalNotFound: true, inlineCss: true },
  // os endereços antigos (/pt-BR e /en com o roteador de idiomas) continuam funcionando
  poweredByHeader: false,
  // Cabeçalhos de segurança para todas as respostas. A política de conteúdo não limita os
  // scripts (o tema é aplicado por um script em linha antes da pintura), só o resto.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/pt-BR", destination: "/", permanent: true },
      // os currículos do site antigo, que podem estar em links já enviados
      { source: "/assets/CV-Kayo-Kalinauskas-pt-BR.pdf", destination: "/curriculo.pdf", permanent: true },
      { source: "/assets/CV-Kayo-Kalinauskas-en.pdf", destination: "/resume.pdf", permanent: true },
      // quem digita o nome da página, como no "man kayo", cai na página principal
      { source: "/kayo", destination: "/", permanent: true },
      { source: "/en/kayo", destination: "/en", permanent: true },
    ];
  },
};

export default nextConfig;
