import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: false,
  devIndicators: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
