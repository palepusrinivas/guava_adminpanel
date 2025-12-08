import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix Turbopack root directory - explicitly set to project root
  experimental: {
    turbopack: {
      root: __dirname,
    },
  },
  images: {
    remotePatterns: [
      { hostname: "s3-ap-southeast-1.amazonaws.com" },
      { hostname: "olawebcdn.com" },
      { hostname: "cdn.pixabay.com" },
      { hostname: "firebasestorage.googleapis.com" },
      { hostname: "storage.googleapis.com" },
    ],
  },
  // proxy for api requests
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://gauva-b7gaf7bwcwhqa0c6.canadacentral-01.azurewebsites.net/api/:path*",
        // Uncomment below to use production backend instead
        // destination: "https://ride-fast-app-backend-latest.onrender.com/api/:path*",
      },
    ];
  },
};

export default nextConfig;
