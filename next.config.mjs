import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // NOTE: This rewrite is disabled for production because adminAxios uses absolute URLs from config.API_BASE_URL
  // The rewrite would only be needed if using relative URLs (like /api/...)
  // For production, axios makes direct requests to the backend, bypassing Next.js rewrites
  async rewrites() {
    // Commented out for production - axios makes direct requests to backend
    // Uncomment for local development if you want to proxy through Next.js
    return [
      // {
      //   source: "/api/:path*",
      //   destination: "https://gauva-f6f6d9ddagfqc9fw.southindia-01.azurewebsites.net/api/:path*",
      // },
    ];
  },
};

export default nextConfig;
