import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images:{ remotePatterns:[
    {protocol:'https',hostname:'covers.openlibrary.org'}
  ]},
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
