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
  // ใช้ค่าจาก .env / Docker build-arg — ห้าม hardcode localhost ใน production build
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || '',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || '',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  },
  // Disable image optimization for static export compatibility
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes work correctly
  trailingSlash: false,
}

module.exports = nextConfig
