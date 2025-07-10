import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // This is the crucial line
  output: 'export',

  // Your other configurations might be here
  // reactStrictMode: true,
  images: { unoptimized: true } // May be needed for static exports if using next/image
};

export default nextConfig;
