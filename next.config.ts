import type { NextConfig } from "next";

/**
 * MacroVault Next.js configuration.
 *
 * The application is fully dynamic (session-cookie based, per-user data), so
 * component caching is intentionally disabled to keep semantics predictable
 * across the dashboard, logging and plan views.
 */
const nextConfig: NextConfig = {
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
