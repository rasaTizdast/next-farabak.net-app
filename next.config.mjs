/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactStrictMode: false, // Disable React Strict Mode
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "farabak.storage.c2.liara.space", // Correctly specify the hostname
      },
    ],
  },
};

export default nextConfig;