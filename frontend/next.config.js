/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure static assets work correctly
  assetPrefix: undefined,
  basePath: '',
  // Explicitly set distDir
  distDir: '.next',
  // Output standalone for Docker production
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
  },
  // Disable image optimization for static export compatibility
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes work correctly
  trailingSlash: false,
}

module.exports = nextConfig
