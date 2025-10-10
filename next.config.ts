import type { NextConfig } from 'next';
import createPwaPlugin from 'next-pwa';
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

const withPWA = createPwaPlugin({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

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

export default withPWA(nextConfig);
