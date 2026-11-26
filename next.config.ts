import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Coolify Dockerfile build: only Next's standalone server goes in the image.
  output: "standalone",
  // Pin the project root so a stray lockfile in a parent folder cannot nest the standalone output.
  turbopack: { root: __dirname },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  async headers() {
    if (process.env.SITE_NOINDEX !== "true") return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "25mb"
    }
  }
};

export default nextConfig;
