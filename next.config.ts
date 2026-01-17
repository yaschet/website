import type { NextConfig } from "next";
import { withContentlayer } from "next-contentlayer";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Add empty turbopack config to allow webpack-based plugins like Contentlayer
  turbopack: {},
};

export default withContentlayer(nextConfig);
