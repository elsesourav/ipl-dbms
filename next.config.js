/** @type {import('next').NextConfig} */
const nextConfig = {
   reactStrictMode: true,
   swcMinify: true,
   typescript: {
      ignoreBuildErrors: true,
   },
   eslint: {
      ignoreDuringBuilds: true,
   },
   experimental: {
      serverActions: {
         allowedOrigins: ["localhost:3000"],
      },
   },
   images: {
      domains: ["localhost"],
   },
};

module.exports = nextConfig;
