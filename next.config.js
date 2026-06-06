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
  // Netlify sets NETLIFY=true and uses @netlify/plugin-nextjs instead — standalone conflicts with it.
  ...(process.env.NETLIFY ? {} : { output: "standalone" }),
};

export default nextConfig;
