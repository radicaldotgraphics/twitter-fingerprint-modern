import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Optimize for better hydration
  reactStrictMode: true,
  // Handle browser extension modifications
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
