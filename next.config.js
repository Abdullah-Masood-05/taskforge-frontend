/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/media/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/media/**",
      },
    ],
  },
  // Expose the API URL to client-side code
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
  },
  // standalone output is needed for Docker/self-hosted.
  // Netlify and Vercel both have their own build adapters — standalone conflicts with them.
  ...(process.env.NETLIFY || process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
