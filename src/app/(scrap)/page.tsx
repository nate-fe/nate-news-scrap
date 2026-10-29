import { Suspense } from "react";
import { MyScrapList, parseScrapFilter, parseScrapPage } from "@/components/my-scrap-list";
import { RankingPanel } from "@/components/ranking-panel";
import { LoadingBlock } from "@/components/loading-block";

type SearchParams = PageProps<"/">["searchParams"];

// 홈 = 내 스크랩함. 랭킹(기사 단위 익명 집계)은 보조 영역으로 둔다.
// PC: 왼쪽 내 스크랩 / 오른쪽 랭킹, 모바일: 내 스크랩 아래에 랭킹.
export default function HomePage(props: PageProps<"/">) {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <Home searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Home({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filter = parseScrapFilter(sp);
  const page = parseScrapPage(sp);

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-6">
      <section>
        <Suspense fallback={<LoadingBlock />}>
          <MyScrapList filter={filter} page={page} />
        </Suspense>
      </section>

      <aside className="mt-10 lg:sticky lg:top-6 lg:mt-0">
        <RankingPanel />
      </aside>
    </div>
  );
}
