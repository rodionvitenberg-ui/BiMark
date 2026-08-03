import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// basePath is baked at build time from NEXT_PUBLIC_BASE_PATH (e.g. /bimark).
// Empty string for local dev without sub-path.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") || "";

const nextConfig: NextConfig = {
  basePath: basePath || undefined,
  // Never use output: "standalone" — deploy uses classic `next start`.
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "maintest.site" },
      { protocol: "https", hostname: "www.maintest.site" },
      { protocol: "https", hostname: "bimark.org" },
      { protocol: "https", hostname: "www.bimark.org" },
      { protocol: "http", hostname: "127.0.0.1" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default withNextIntl(nextConfig);
