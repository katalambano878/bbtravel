import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb"
    }
  }
};

export default nextConfig;
