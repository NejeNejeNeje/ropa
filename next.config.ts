import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude Prisma and bcryptjs from edge middleware bundle (keeps it under 1MB)
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
};

export default nextConfig;
