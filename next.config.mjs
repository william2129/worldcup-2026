/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静态导出 - 全部页面变 HTML,适配 Cloudflare Pages / GitHub Pages 等纯静态托管
  output: 'export',
  images: {
    // 静态导出不能用 Next 的图片优化服务,必须设 unoptimized
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'flagcdn.com' },
      { protocol: 'https', hostname: 'crests.football-data.org' },
    ],
  },
  // 静态导出不需要 serverless function bundling,但保留这条无副作用
  outputFileTracingIncludes: {
    '/**/*': ['./data/**/*.json'],
  },
  typedRoutes: false,
};

export default nextConfig;
