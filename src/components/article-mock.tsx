import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticle, getMyFolders, getMyScrapForArticle, getVisibleComments } from "@/lib/data";
import { formatDateTime } from "@/lib/format";
import { ArticleStatusText } from "@/components/article-status-text";
import { CommentScrapHeader } from "@/components/comment-scrap-header";
import { ScrapIconButton } from "@/components/scrap-icon-button";
import { ARTICLE_TOOL_BUTTON } from "@/components/article-tool-button";
import { Icon } from "@/components/icon";

// 네이트 뉴스 기사 화면 목업 (기사 본문 + 댓글 영역).
// 실제 서비스에서는 기존 기사 페이지에 스크랩 진입점만 붙는다:
// 기사 상단 아이콘 줄('AI요약' 왼쪽)과 댓글 머리줄('MY댓글' 왼쪽).
// 원칙: 메모는 사람에 귀속되므로 기사 페이지에 노출하지 않는다.
export async function ArticleMock({ id }: { id: string }) {
  const article = await getArticle(id);
  if (!article) notFound();

  if (article.status === "deleted") {
    return <div className="md-card p-8 text-center text-on-surface-variant">삭제된 기사입니다.</div>;
  }

  const [myScrap, comments, folders] = await Promise.all([
    getMyScrapForArticle(id),
    getVisibleComments(id),
    getMyFolders(),
  ]);
  const folderOptions = folders.map((f) => ({ id: f.id, name: f.name }));

  return (
    <div className="space-y-3">
      <article className="md-card p-5 sm:p-6">
        <h1 className="mb-3 text-[28px] leading-9 font-extrabold">{article.title}</h1>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
          <span>{article.pressName}</span>
          <span aria-hidden>·</span>
          <span>{formatDateTime(article.publishedAt)}</span>
          <ArticleStatusText status={article.status} />
        </div>

        {/* 반응 · 도구 줄 (네이트 뉴스 기사 상단과 같은 배치). 스크랩은 기존 'AI요약' 바로 왼쪽에 붙인다. */}
        <div className="mb-5 flex items-center justify-between gap-1.5 pt-6">
          <div className="flex gap-1.5 text-[15px] font-bold text-on-surface sm:gap-2 sm:text-sm">
            <span className="flex h-9 items-center gap-1 rounded-full bg-surface-container-high px-2.5 sm:h-10 sm:gap-1.5 sm:px-3.5">
              <span aria-hidden>💬</span>
              {comments.length}
            </span>
            <span className="flex h-9 items-center gap-1 rounded-full bg-surface-container-high px-2.5 sm:h-10 sm:gap-1.5 sm:px-3.5">
              <span aria-hidden>🙂</span>
              {Math.round(comments.length / 2)}
            </span>
          </div>
          {/* 팝업 위치 기준: 아이콘 줄 오른쪽 끝 */}
          <div className="relative flex items-center gap-1.5 sm:gap-2">
            <ScrapIconButton articleId={article.id} scrapId={myScrap?.id} folders={folderOptions} />
            {/* 이하 기존 네이트 뉴스 기능 자리 (목업) */}
            <span className="relative">
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-[#eceefe] px-2 py-0.5 text-xs font-bold whitespace-nowrap text-[#5a5fd6]">
                AI요약
              </span>
              <span aria-label="AI요약" className={ARTICLE_TOOL_BUTTON}>
                <Icon name="robot" size={20} />
              </span>
            </span>
            <span aria-label="글자 크기" className={`${ARTICLE_TOOL_BUTTON} text-[17px] font-bold`}>
              가<sup className="text-[12px]">+</sup>
            </span>
            <span aria-label="공유" className={ARTICLE_TOOL_BUTTON}>
              <Icon name="share" size={20} />
            </span>
          </div>
        </div>

        {article.imageUrl && (
          <Image
            src={article.imageUrl}
            alt=""
            width={640}
            height={400}
            unoptimized
            className="mb-4 w-full rounded-md-md"
          />
        )}
        <p className="leading-7 text-on-surface">(기사 본문 목업)</p>
      </article>

      <section id="comments" className="md-card scroll-mt-20 p-5 sm:p-6">
        <CommentScrapHeader
          articleId={article.id}
          commentCount={comments.length}
          scrapId={myScrap?.id}
          folders={folderOptions}
        />
        {/* 댓글 입력창 자리 (목업) */}
        <div className="mb-2 rounded-md-md bg-surface-container-high px-4 py-3 text-sm text-on-surface-variant">
          로그인 해주세요
        </div>
        <ul className="divide-y divide-outline-variant text-sm">
          {comments.slice(0, 20).map((c) => (
            <li key={c.id} className="py-3">
              <span className="mr-2 font-bold">{c.authorName}</span>
              <span className="text-on-surface">{c.content}</span>
              <span className="ml-2 text-xs text-on-surface-variant">{formatDateTime(c.createdAt)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
