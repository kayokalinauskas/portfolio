import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // com um layout por idioma, o 404 do site todo precisa do global-not-found
  experimental: { globalNotFound: true },
  // os endereços antigos (/pt-BR e /en com o roteador de idiomas) continuam funcionando
  async redirects() {
    return [{ source: "/pt-BR", destination: "/", permanent: true }];
  },
};

export default nextConfig;
