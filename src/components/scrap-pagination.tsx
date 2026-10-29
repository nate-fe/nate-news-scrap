import Link from "next/link";
import { scrapListHref } from "@/lib/scrap-list-url";
import { Icon } from "@/components/icon";
import type { MyScrapFilter } from "@/types/scrap";

/** 한 번에 보여줄 페이지 번호 개수 */
const WINDOW = 5;

// 내 스크랩 목록 페이지 번호. ‹ 1 2 3 › 형태이며, 현재 페이지는 포인트 컬러로 표시한다.
export function ScrapPagination({
  filter,
  page,
  pageCount,
}: {
  filter: MyScrapFilter;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  // 현재 페이지가 가운데 오도록 번호 범위를 잡는다
  const start = Math.max(1, Math.min(page - Math.floor(WINDOW / 2), pageCount - WINDOW + 1));
  const pages = Array.from({ length: Math.min(WINDOW, pageCount) }, (_, i) => start + i);

  return (
    <nav aria-label="내 스크랩 페이지" className="mt-4 flex items-center justify-center gap-1">
      <PageArrow href={page > 1 ? scrapListHref(filter, page - 1) : undefined} label="이전 페이지" icon="chevronLeft" />
      {pages.map((p) =>
        p === page ? (
          <span
            key={p}
            aria-current="page"
            className="flex h-9 min-w-8 items-center justify-center px-1 text-base font-extrabold text-primary"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={scrapListHref(filter, p)}
            className="flex h-9 min-w-8 items-center justify-center px-1 text-base font-bold text-on-surface-variant hover:text-on-surface"
          >
            {p}
          </Link>
        ),
      )}
      <PageArrow
        href={page < pageCount ? scrapListHref(filter, page + 1) : undefined}
        label="다음 페이지"
        icon="chevronRight"
      />
    </nav>
  );
}

function PageArrow({ href, label, icon }: { href?: string; label: string; icon: "chevronLeft" | "chevronRight" }) {
  // 번호와 맞춰 테두리·배경 없이 아이콘만 둔다
  const className = "flex size-9 items-center justify-center text-on-surface-variant";
  if (!href) {
    return (
      <span aria-disabled className={`${className} opacity-30`}>
        <Icon name={icon} size={18} />
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={`${className} hover:text-on-surface`}>
      <Icon name={icon} size={18} />
    </Link>
  );
}
