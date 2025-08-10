import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  // Add performance optimizations for better navigation
  experimental: {
    optimizeCss: true,
    optimizeServerReact: true,
  },
  // Optimize prefetching for better navigation
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/seed/**',
      },
      {
        protocol: 'https',
        hostname: 'swhlekigmfdbwulrncot.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'avatar.vercel.sh',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Optimize bundling for better performance
  webpack: (config, { dev, isServer }) => {
    // Add a rule to handle .node files, which are used by some native modules
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    })

    // Keep existing optimizations for client-side builds
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      }
    }

    // Handle Node.js modules for server-side builds
    if (isServer) {
      // Externalize Stagehand and related modules to prevent bundling issues
      // config.externals.push('@browserbasehq/stagehand')

      // // Handle worker thread modules that shouldn't be bundled
      // config.externals.push({
      //   worker_threads: 'commonjs worker_threads',
      //   child_process: 'commonjs child_process',
      //   fs: 'commonjs fs',
      //   path: 'commonjs path',
      // })

      // Resolve fallbacks for Node.js modules in server-side context
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        stream: false,
        util: false,
        os: false,
      }
    }

    return config
  },
}

export default nextConfig
