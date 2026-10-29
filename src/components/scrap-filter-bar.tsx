"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Icon } from "@/components/icon";
import { scrapListHref } from "@/lib/scrap-list-url";
import type { MyScrapFilter } from "@/types/scrap";

// 내 스크랩 검색·필터 바.
// - 검색: 검색창 안의 검색 버튼(또는 Enter)으로 적용, 글자가 있으면 X 버튼으로 지우기
// - 언론사·메모 필터: 바꾸는 즉시 반영
// 필터 상태는 URL에 남겨 새로고침·공유해도 그대로 보이게 한다.
export function ScrapFilterBar({ filter, pressNames }: { filter: MyScrapFilter; pressNames: string[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState(filter.q ?? "");
  const [pending, startTransition] = useTransition();

  const apply = (patch: Partial<MyScrapFilter>) => {
    startTransition(() => {
      // 필터가 바뀌면 1페이지부터 다시 보여준다
      router.replace(scrapListHref({ ...filter, q, ...patch }), { scroll: false });
    });
  };

  const clearSearch = () => {
    setQ("");
    inputRef.current?.focus();
    // 이미 검색이 적용된 상태였다면 검색 조건도 풀어준다
    if (filter.q) apply({ q: "" });
  };

  return (
    <div className="mb-4 space-y-3">
      {/* MD3 search bar: 지우기(X)·검색 버튼을 안에 둔다 */}
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          apply({ q });
        }}
        className="relative flex h-14 items-center gap-1 overflow-hidden rounded-full bg-surface pr-1 pl-5 focus-within:shadow-elevation-1"
      >
        <input
          ref={inputRef}
          type="text"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="제목·메모 검색"
          aria-label="제목·메모 검색"
          className="h-full min-w-0 flex-1 bg-transparent text-base text-on-surface outline-none placeholder:text-on-surface-variant"
        />
        {q.length > 0 && (
          <button type="button" onClick={clearSearch} aria-label="검색어 지우기" className="md-icon-btn">
            <Icon name="close" size={20} />
          </button>
        )}
        <button type="submit" aria-label="검색" className="md-icon-btn size-12 text-on-surface">
          <Icon name="search" size={24} />
        </button>
        {/* MD3 linear progress: 목록을 다시 불러오는 동안 */}
        {pending && <span className="absolute inset-x-0 bottom-0 h-0.5 animate-pulse bg-primary" />}
      </form>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <select
          aria-label="언론사"
          value={filter.press ?? ""}
          onChange={(e) => apply({ press: e.target.value || undefined })}
          className={`md-chip pr-2 ${filter.press ? "md-chip-selected" : ""}`}
        >
          <option value="">전체 언론사</option>
          {pressNames.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        {/* filter chip */}
        <button
          type="button"
          aria-pressed={!!filter.memoOnly}
          onClick={() => apply({ memoOnly: !filter.memoOnly })}
          className={`md-chip ${filter.memoOnly ? "md-chip-selected" : ""}`}
        >
          {filter.memoOnly && <Icon name="check" size={18} />}
          메모 있는 것만
        </button>
      </div>
    </div>
  );
}
