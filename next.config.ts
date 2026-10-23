import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // com um layout por idioma, o 404 do site todo precisa do global-not-found
  experimental: { globalNotFound: true },
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
    return [{ source: "/pt-BR", destination: "/", permanent: true }];
  },
};

export default nextConfig;
