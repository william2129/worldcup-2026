// 淘汰赛对阵图 - 占位版本,后续接入真实抽签后再细化
import { SectionHeader } from '@/components/section-header';

export default function BracketPage() {
  const rounds = ['1/16 决赛', '1/8 决赛', '1/4 决赛', '半决赛', '决赛'];
  return (
    <div className="space-y-6">
      <SectionHeader
        title="淘汰赛对阵图"
        subtitle="小组赛结束后由系统根据 AI 预测填充。当前为示意结构。"
      />
      <div className="card overflow-x-auto p-6">
        <div className="flex min-w-[1100px] items-stretch gap-6">
          {rounds.map((title, ri) => (
            <div key={title} className="flex w-44 flex-col justify-around gap-3">
              <h3 className="text-center text-xs font-semibold uppercase tracking-wider text-pitch-muted">
                {title}
              </h3>
              {Array.from({ length: Math.max(1, 16 >> ri) }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-16 flex-col justify-center rounded-md border border-pitch-line bg-pitch-deep px-3 text-xs text-pitch-muted"
                >
                  <span className="truncate">待定 1</span>
                  <span className="truncate">待定 2</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-pitch-muted">
        小组赛阶段完成后,AI 将根据出线情况自动生成对阵 + 全程预测路径。
      </p>
    </div>
  );
}
