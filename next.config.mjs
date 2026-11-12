/** @type {import('next').NextConfig} */

const allowedHostnames = [
  process.env.NODE_ENV === "development" && "localhost",
  "s3.farabak.net",
  // Add other production domains here
].filter(Boolean);

const nextConfig = {
  // jsdom reads browser/default-stylesheet.css at runtime. Keeping the
  // isomorphic sanitizer external avoids bundling that file-relative lookup
  // into a server chunk where the asset path is no longer valid.
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  // The framework defaults to a 50 MB in-process cache. Keep a bounded hot
  // cache, but leave headroom for React rendering, Prisma, Sharp, and Node.
  cacheMaxMemorySize: 16 * 1024 * 1024,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  // output: "standalone",
  // reactStrictMode: false, // Disable React Strict Mode
  images: {
    remotePatterns: allowedHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
      port: "",
      pathname: "/**",
    })),
    // These origins already store WebP derivatives. Avoid the slower first-hit
    // AVIF encode on the small production container; WebP remains broadly supported.
    formats: ["image/webp"],
    deviceSizes: [375, 485, 640, 768, 1024, 1280, 1440, 1536, 1920, 2048],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
    qualities: [50, 75, 90, 100],
  },
  // Performance optimizations
  experimental: {
    // This app has a large route graph (including many admin/API bundles).
    // Loading every route module at boot consumes most of a small container's
    // memory before it has served a single request. Load routes on demand.
    preloadEntriesOnStart: false,
  },
  // Turbopack configuration (now stable)
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  // Enable compression
  compress: true,
  // Content negotiation cache-safety: declare Accept so CDNs never serve
  // a cached HTML variant to an agent asking for text/markdown (or vice versa)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Vary", value: "Accept" }],
      },
    ];
  },
  // Enable static optimization
  trailingSlash: false,
  // Optimize for production
  productionBrowserSourceMaps: false,
};

export default nextConfig;
