import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArticleMock } from "@/components/article-mock";
import { LoadingBlock } from "@/components/loading-block";
import { GUIDE_ARTICLE_ID } from "@/lib/config";

export const metadata: Metadata = { title: "스크랩 하는 법" };

// '스크랩 하는 법(임시)': 네이트 뉴스 기사 목업 위에서 스크랩 진입점을 직접 눌러볼 수 있는 안내 화면.
// 진입점은 기사 댓글 영역 머리줄의 '스크랩하기' (기존 'MY댓글' 왼쪽).
export default function ScrapGuidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <section className="md-card border-2 border-primary p-5">
        <h1 className="mb-2 text-lg font-extrabold">스크랩 하는 법 (임시 안내)</h1>
        <ol className="list-decimal space-y-1 pl-5 text-sm leading-6 text-on-surface">
          <li>
            네이트 뉴스 기사 아래 <b>댓글 영역</b>에서 <b className="text-primary">스크랩하기</b>를 눌러요.
          </li>
          <li>지금 드는 생각을 메모로 남기고(선택) 스크랩하기를 누르면 저장돼요.</li>
          <li>저장한 기사와 메모는 나만 볼 수 있고, &lsquo;내 스크랩&rsquo;에서 다시 볼 수 있어요.</li>
        </ol>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="#comments" className="md-btn md-btn-tonal h-9 px-4">
            댓글 영역으로 이동
          </Link>
          <Link href="/" className="md-btn md-btn-text h-9">
            내 스크랩 보기
          </Link>
        </div>
      </section>

      <Suspense fallback={<LoadingBlock />}>
        <ArticleMock id={GUIDE_ARTICLE_ID} />
      </Suspense>
    </div>
  );
}
