/** @type {import('next').NextConfig} */

const allowedHostnames = [
  process.env.NODE_ENV === "development" && "localhost",
  // "farabak.storage.c2.liara.space",
  "farabaks3.storage.c2.liara.space",
  // Add other production domains here
].filter(Boolean);

const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // output: "standalone",
  // reactStrictMode: false, // Disable React Strict Mode
  images: {
    remotePatterns: allowedHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
      port: "",
      pathname: "/**",
    })),
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Performance optimizations
  experimental: {
    optimizePackageImports: ['react-icons', 'axios'],
  },
  // Turbopack configuration (now stable)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  // Enable compression
  compress: true,
  // Enable static optimization
  trailingSlash: false,
  // Optimize for production
  productionBrowserSourceMaps: false,
  // Optimize bundle (Note: This uses Webpack, not Turbopack)
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Disable source maps in production for better performance
      config.devtool = false;
      
      // Optimize bundle splitting for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
            maxSize: 244000,
          },
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
            name: 'react',
            priority: 20,
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: -5,
            reuseExistingChunk: true,
            maxSize: 244000,
          },
        },
      };
      
      // CSS optimization
      config.optimization.minimize = true;
      
      // Tree shaking optimization
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }
    return config;
  },
};

export default nextConfig;
