import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.lhr.life",
    "80bbdff0213262.lhr.life",
    "*.loca.lt",
    "192.168.0.205",
    "localhost:3000",
  ],
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
