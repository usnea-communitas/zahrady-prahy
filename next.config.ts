import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The illustrations are pre-sized WebP files served as static assets. The
  // image endpoint only redirected to them, adding a server round trip.
  images: { unoptimized: true },
  // Security headers on the page. A CSP for scripts waits for the static
  // rebuild (Z-01): the server-rendered page still carries inline scripts.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
