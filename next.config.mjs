/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'crests.football-data.org' },
    ],
  },
  // 确保 data/*.json 被打包进 Vercel 的 serverless function bundle
  outputFileTracingIncludes: {
    '/**/*': ['./data/**/*.json'],
  },
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
