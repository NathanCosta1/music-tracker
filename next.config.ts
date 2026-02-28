import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Other config options can go here */

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'is1-ssl.mzstatic.com',
        port: '',
        pathname: '/image/thumb/**',
      },
    ],
  },
};

export default nextConfig;
