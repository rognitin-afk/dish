import type { NextConfig } from "next";

/**
 * Next.js 16 uses Turbopack by default for `next dev` (faster Fast Refresh, incremental builds).
 * No extra config needed for Turbopack. Use `npm run dev:webpack` if you need Webpack fallback.
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack
 */
const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
