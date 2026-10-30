import { Suspense } from "react";
import { getHeatedAfterScrap, getMostScrapped } from "@/lib/data";
import { RankingList, type RankingItem } from "@/components/ranking-list";
import { PeriodRanking } from "@/components/period-ranking";
import { LoadingBlock } from "@/components/loading-block";
import { Icon, type IconName } from "@/components/icon";
import type { ArticleScrapStat } from "@/types/scrap";

// 홈의 보조 영역: PC에서는 오른쪽, 모바일에서는 내 스크랩 목록 아래.
export function RankingPanel() {
  return (
    <div className="space-y-3">
      <section className="md-card p-4">
        <PanelTitle icon="bookmark" title="많이 스크랩된 기사" />
        <Suspense fallback={<LoadingBlock />}>
          <MostScrapped />
        </Suspense>
      </section>

      <section className="md-card p-4">
        <PanelTitle icon="trendingUp" title="스크랩 이후 여론이 뜨거워진 기사" />
        <Suspense fallback={<LoadingBlock />}>
          <Heated />
        </Suspense>
      </section>
    </div>
  );
}

function PanelTitle({ icon, title }: { icon: IconName; title: string;}) {
  return (
    <div className="mb-3">
      {/* 한 줄 유지: 16px + 작은 아이콘으로 오른쪽 패널(320px) 폭에 맞추고, 그래도 넘치면 … 처리 */}
      <h2 className="flex items-center gap-1.5 text-[16px] font-extrabold text-on-surface">
        <Icon name={icon} size={18} className="text-primary" />
        <span className="min-w-0 truncate" title={title}>
          {title}
        </span>
      </h2>
    </div>
  );
}

function toItems(stats: ArticleScrapStat[], metric: (s: ArticleScrapStat) => string): RankingItem[] {
  return stats.map((s) => ({
    id: s.article.id,
    title: s.article.title,
    url: s.article.url,
    pressName: s.article.pressName,
    metricLabel: metric(s),
  }));
}

async function MostScrapped() {
  const [day, week] = await Promise.all([getMostScrapped("24h"), getMostScrapped("7d")]);
  const metric = (s: ArticleScrapStat) => `스크랩 ${s.scrapCount}`;
  return <PeriodRanking itemsByPeriod={{ "24h": toItems(day, metric), "7d": toItems(week, metric) }} />;
}

async function Heated() {
  const stats = await getHeatedAfterScrap();
  return (
    <RankingList items={toItems(stats, (s) => `스크랩 이후 댓글 +${Math.round(s.avgCommentsSinceScrap)}`)} />
  );
}
