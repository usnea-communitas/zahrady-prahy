import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The illustrations are pre-sized WebP files served as static assets. The
  // image endpoint only redirected to them, adding a server round trip.
  images: { unoptimized: true },
};

export default nextConfig;
