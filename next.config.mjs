import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Suppress punycode deprecation warning from dependencies
if (process.env.NODE_ENV === 'development') {
  const originalEmit = process.emit;
  process.emit = function (name, data, ...args) {
    if (
      name === 'warning' &&
      typeof data === 'object' &&
      data.name === 'DeprecationWarning' &&
      data.message.includes('punycode')
    ) {
      return false;
    }
    return originalEmit.apply(process, arguments);
  };
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  // Disable strict mode temporarily to prevent double-rendering issues
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    // Temporarily disable turbo as it can cause compilation issues
    // turbo: {
    //   rules: {
    //     '*.svg': {
    //       loaders: ['@svgr/webpack'],
    //       as: '*.js',
    //     },
    //   },
    // },
  },
  // Add webpack optimization for faster builds
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // Optimize development builds
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

export default withNextIntl(nextConfig);