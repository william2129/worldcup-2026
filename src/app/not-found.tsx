import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="font-display text-7xl font-bold text-pitch-muted">404</div>
      <p className="mt-3 text-sm text-pitch-muted">这一脚踢飞了 · 没找到这个页面</p>
      <Link
        href="/"
        className="mt-6 rounded-lg border border-pitch-line bg-pitch-card px-4 py-2 text-sm hover:border-accent-green/40"
      >
        返回首页
      </Link>
    </div>
  );
}
