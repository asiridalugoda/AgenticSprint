import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    // Netlify restores .next/cache between builds. The same setup shipped a
    // stale stylesheet from that cache on dalugoda.com more than once, so the
    // file-system build cache stays off.
    turbopackFileSystemCacheForBuild: false,
  },
  async redirects() {
    // The manifesto is the front page. Its document address stays valid so a
    // citation that names it still resolves.
    return [{ source: "/manifesto", destination: "/", permanent: true }];
  },
};

export default nextConfig;
