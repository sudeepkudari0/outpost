import type { NextConfig } from 'next';
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
      },
      {
        protocol: 'https',
        hostname: 'trmobile.houseofdharz.com',
      },
    ],
  },
};

export default nextConfig;
