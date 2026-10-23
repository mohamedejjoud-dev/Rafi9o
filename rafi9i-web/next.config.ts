import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Hide the Next.js dev-mode route indicator (the black "N" badge). It never
  // appears in production builds; compile/runtime errors are still shown.
  devIndicators: false,
};

export default nextConfig;
