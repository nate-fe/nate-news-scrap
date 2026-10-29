import { Suspense } from "react";
import { ArticleMock } from "@/components/article-mock";
import { LoadingBlock } from "@/components/loading-block";

// 스크랩 화면에서 누른 기사 링크의 도착 화면 (목업).
// 실제 서비스에서는 네이트 뉴스 기사 URL로 바로 연결되므로, 기사 화면 위에 덮개를 깔아 그 뜻을 표시한다.
// 덮개가 화면을 막으므로 스크랩 시연은 '스크랩 하는 법(임시)' 화면의 기사에서만 한다.
export default function ArticlePage(props: PageProps<"/articles/[id]">) {
  return (
    <div className="mx-auto max-w-3xl">
      <Suspense fallback={<LoadingBlock />}>
        <ArticleView params={props.params} />
      </Suspense>
      <MovingToArticleDim />
    </div>
  );
}

// 보고용 표시: 이 화면은 새로 만든 페이지가 아니라 기존 네이트 뉴스 기사로 연결된다는 뜻.
// 기사 화면 위에 어두운 덮개를 깔고 문구를 올린다.
function MovingToArticleDim() {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/75">
      <p className="px-7 py-3.5 text-lg font-extrabold text-white shadow-elevation-3">해당 기사로 이동</p>
    </div>
  );
}

async function ArticleView({ params }: { params: PageProps<"/articles/[id]">["params"] }) {
  const { id } = await params;
  return <ArticleMock id={id} />;
}
