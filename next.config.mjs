/** @type {import('next').NextConfig} */

const allowedHostnames = [
  process.env.NODE_ENV === "development" && "localhost",
  "farabak.storage.c2.liara.space",
  // Add other production domains here
].filter(Boolean);

const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  output: "standalone",
  // reactStrictMode: false, // Disable React Strict Mode
  images: {
    remotePatterns: allowedHostnames.map((hostname) => ({
      protocol: "https",
      hostname,
      port: "",
      pathname: "/**",
    })),
  },
};

export default nextConfig;
