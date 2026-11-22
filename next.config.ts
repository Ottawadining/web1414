import type { NextConfig } from "next";

// Static export for GitHub Pages. Everything dynamic runs in the browser
// against Supabase, where Row Level Security enforces the rules.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true, // every page is folder/index.html: works cleanly on GitHub Pages
  poweredByHeader: false,
};

export default nextConfig;
