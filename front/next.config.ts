import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Movido desde experimental a la raíz de la configuración
  serverExternalPackages: ['@vitejs/plugin-basic-ssl']
};

export default nextConfig;