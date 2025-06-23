import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BUILD_DATE: new Date().toISOString(),
  },
  experimental: {
    reactCompiler: false,
  },
  // Ensure proper hydration
  reactStrictMode: true,
  // Suppress hydration warnings in development
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

export default nextConfig;
