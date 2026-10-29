"use client";

import { useState } from "react";
import { RankingList, type RankingItem } from "@/components/ranking-list";
import type { RankingPeriod } from "@/types/scrap";

const PERIOD_LABELS: Record<RankingPeriod, string> = { "24h": "24시간", "7d": "7일" };

// "많이 스크랩된 기사"의 24시간/7일 전환.
// 두 기간 데이터를 미리 받아두고 브라우저에서 바로 바꾼다. 바꾸면 1페이지부터 보여준다.
export function PeriodRanking({ itemsByPeriod }: { itemsByPeriod: Record<RankingPeriod, RankingItem[]> }) {
  const [period, setPeriod] = useState<RankingPeriod>("24h");

  return (
    <>
      {/* MD3 tabs: 선택된 탭에 포인트 컬러 밑줄 */}
      <div role="tablist" aria-label="집계 기간" className="mb-2 grid grid-cols-2 border-b border-outline-variant">
        {(["24h", "7d"] as const).map((p) => {
          const selected = p === period;
          return (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setPeriod(p)}
              className={`-mb-px h-10 cursor-pointer border-b-2 text-sm transition-colors ${
                selected
                  ? "border-primary font-extrabold text-on-surface"
                  : "border-transparent font-bold text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          );
        })}
      </div>
      {/* key가 바뀌면 목록이 새로 만들어져 페이지가 1로 돌아간다 */}
      <RankingList key={period} items={itemsByPeriod[period]} />
    </>
  );
}
