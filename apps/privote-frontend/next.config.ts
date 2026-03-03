import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,
  webpack: config => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false
    };

    config.externals.push(
      'pino-pretty',
      'lokijs',
      'encoding',
      {
        'node-gyp-build': 'commonjs node-gyp-build'
      },
      'hardhat'
    );
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

export default nextConfig;
