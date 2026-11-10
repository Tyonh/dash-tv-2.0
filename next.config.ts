import type { NextConfig } from "next";

// Identificador único de cada build: a TV compara com o do servidor para saber se há versão nova
const ID_DO_BUILD = process.env.BUILD_ID ?? String(Date.now());

const nextConfig: NextConfig = {
  reactStrictMode: true,
  generateBuildId: async () => ID_DO_BUILD,
  env: { NEXT_PUBLIC_BUILD_ID: ID_DO_BUILD },
  images: { unoptimized: true },
  // Biblioteca com binário nativo: precisa ficar fora do pacote do Next
  serverExternalPackages: ["@mattnucc/gribberish"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
