import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Playwright's webServer drives the dev server via 127.0.0.1 (see
  // playwright.config.ts); without this, HMR requests from that origin
  // are blocked as cross-origin in dev.
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
