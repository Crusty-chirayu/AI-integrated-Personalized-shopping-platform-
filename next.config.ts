import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },

  images: {
    remotePatterns: [
      // Supabase Storage
      {
        protocol: "https",
        hostname: "zuziczvwhrwzzrrfojzf.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },

      // Unsplash Images
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;