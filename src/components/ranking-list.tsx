"use client";

import { useState } from "react";
import { RANKING_PAGE_SIZE, RANKING_PAGING_MIN } from "@/lib/config";
import { Icon } from "@/components/icon";
import Link from "next/link";

export interface RankingItem {
  id: string;
  title: string;
  url: string;
  pressName: string;
  /** 예: "스크랩 8", "스크랩 이후 댓글 +205" */
  metricLabel: string;
}

// 스크랩 모음 랭킹 (MD3 list). 기사 단위 익명 집계이며 개인·메모는 드러내지 않는다.
// 한 페이지에 5개. 전체가 10개 이상일 때만 좌우 버튼으로 넘긴다.
export function RankingList({ items }: { items: RankingItem[] }) {
  const [page, setPage] = useState(0);

  if (items.length === 0) {
    return <p className="py-4 text-center text-sm text-on-surface-variant">아직 집계할 기사가 없어요.</p>;
  }

  const paged = items.length >= RANKING_PAGING_MIN;
  const pageCount = paged ? Math.ceil(items.length / RANKING_PAGE_SIZE) : 1;
  const start = page * RANKING_PAGE_SIZE;
  const visible = items.slice(start, start + RANKING_PAGE_SIZE);

  return (
    <div>
      <ol className="-mx-2" start={start + 1}>
        {visible.map((item, i) => (
          <li key={item.id}>
            <Link
              href={item.url}
              className="flex gap-3 rounded-md-sm px-2 py-2.5 transition-colors hover:bg-on-surface/8"
            >
              <span className="w-5 shrink-0 text-right text-sm font-extrabold text-primary">{start + i + 1}</span>
              <span className="min-w-0 flex-1">
                <span title={item.title} className="block truncate text-sm leading-5 font-bold text-on-surface">
                  {item.title}
                </span>
                <span className="mt-0.5 block text-xs text-on-surface-variant">
                  {item.pressName} · {item.metricLabel}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {paged && (
        <div className="mt-1 -mb-2 flex items-center justify-end gap-1 text-xs text-on-surface-variant">
          <button
            type="button"
            aria-label="이전 순위"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className="md-icon-btn size-8 border border-outline-variant"
          >
            <Icon name="chevronLeft" size={18} />
          </button>
          <button
            type="button"
            aria-label="다음 순위"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => p + 1)}
            className="md-icon-btn size-8 border border-outline-variant"
          >
            <Icon name="chevronRight" size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
