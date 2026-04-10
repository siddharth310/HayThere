import type { NextConfig } from "next";

/** Optional: comma-separated hostnames for dev (e.g. LAN IP when opening from phone). */
const allowedFromEnv = process.env.ALLOWED_DEV_ORIGINS?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  ...(allowedFromEnv?.length
    ? { allowedDevOrigins: allowedFromEnv }
    : {}),
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
};

export default nextConfig;
