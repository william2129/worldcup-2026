import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: '2026 世界杯 · AI 预测',
  description: '2026 FIFA 世界杯赛程、比分、AI 预测与分析',
};

const NAV = [
  { href: '/', label: '赛程' },
  { href: '/groups', label: '小组赛' },
  { href: '/bracket', label: '淘汰赛' },
  { href: '/teams', label: '球队' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-pitch-deep antialiased">
        <header className="sticky top-0 z-30 border-b border-pitch-line bg-pitch-deep/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent-green to-accent-gold text-pitch-deep">
                <span className="font-display text-base font-bold">26</span>
              </span>
              <div className="leading-tight">
                <div className="font-display text-base font-semibold tracking-wide">FIFA 世界杯 2026</div>
                <div className="text-[11px] text-pitch-muted">AI 预测 · 数据中心</div>
              </div>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-pitch-muted transition hover:bg-pitch-line hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        <footer className="mt-12 border-t border-pitch-line py-6 text-center text-xs text-pitch-muted">
          数据来源 football-data.org · AI 预测仅供娱乐参考 · {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
