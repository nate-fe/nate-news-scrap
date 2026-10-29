import { getMyPressNames, getMyScraps } from "@/lib/data";
import { SCRAP_PAGE_SIZE } from "@/lib/config";
import { ScrapCard } from "@/components/scrap-card";
import { ScrapFilterBar } from "@/components/scrap-filter-bar";
import { ScrapPagination } from "@/components/scrap-pagination";
import type { MyScrapFilter } from "@/types/scrap";

function filterKey(f: MyScrapFilter) {
  return [f.q ?? "", f.press ?? "", f.memoOnly ? "1" : ""].join("|");
}

type RawParams = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export function parseScrapFilter(sp: RawParams): MyScrapFilter {
  return {
    q: first(sp.q) || undefined,
    press: first(sp.press) || undefined,
    memoOnly: first(sp.memo) === "1",
  };
}

/** ?page= 값. 숫자가 아니거나 1보다 작으면 1페이지 */
export function parseScrapPage(sp: RawParams): number {
  const n = Number.parseInt(first(sp.page) ?? "", 10);
  return Number.isFinite(n) && n > 1 ? n : 1;
}

// 내 스크랩 목록: 검색(제목·메모), 언론사 필터, 메모 있는 것만 보기, 10개 단위 페이징. 본인만 접근.
export async function MyScrapList({ filter, page }: { filter: MyScrapFilter; page: number }) {
  const [scraps, pressNames] = await Promise.all([getMyScraps(filter), getMyPressNames()]);
  const filtered = !!(filter.q || filter.press || filter.memoOnly);

  const pageCount = Math.max(1, Math.ceil(scraps.length / SCRAP_PAGE_SIZE));
  // 스크랩을 지워 페이지 수가 줄어든 경우 등, 범위를 벗어나면 마지막 페이지를 보여준다
  const current = Math.min(page, pageCount);
  const visible = scraps.slice((current - 1) * SCRAP_PAGE_SIZE, current * SCRAP_PAGE_SIZE);

  return (
    <>
      {/* 필터가 바뀌면(로고 클릭으로 초기화 등) 검색창 상태도 URL 기준으로 다시 맞춘다 */}
      <ScrapFilterBar key={filterKey(filter)} filter={filter} pressNames={pressNames} />

      {scraps.length === 0 ? (
        <p className="md-card py-10 text-center text-sm text-on-surface-variant">
          {filtered ? "조건에 맞는 스크랩이 없어요." : "아직 스크랩한 기사가 없어요. 기사 페이지에서 스크랩해 보세요."}
        </p>
      ) : (
        <>
          <ul className="space-y-3">
            {visible.map((s) => (
              <li key={s.id}>
                <ScrapCard scrap={s} />
              </li>
            ))}
          </ul>
          <ScrapPagination filter={filter} page={current} pageCount={pageCount} />
        </>
      )}
    </>
  );
}
