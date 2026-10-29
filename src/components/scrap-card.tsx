import Image from "next/image";
import type { ScrapWithArticle } from "@/types/scrap";
import { formatDateTime } from "@/lib/format";
import { ArticleStatusText } from "@/components/article-status-text";
import { MemoEditor } from "@/components/memo-editor";
import { DeleteScrapButton } from "@/components/delete-scrap-button";
import { Icon } from "@/components/icon";
import Link from "next/link";

// 스크랩 카드 (MD3 outlined card). 텍스트 중심이며, 기사 영역과 메모 영역을 시각적으로 분리한다.
export function ScrapCard({ scrap }: { scrap: ScrapWithArticle }) {
  const { article } = scrap;
  const deleted = article.status === "deleted";

  return (
    <article className="md-card overflow-hidden">
      {/* 기사 영역 */}
      <div className="flex gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
            <span className="font-bold">{article.pressName}</span>
            <ArticleStatusText status={article.status} />
          </div>
          {/* 삭제된 기사는 제목·링크 없이 상단의 "삭제된 기사" 표시만 남긴다 */}
          {!deleted && (
            <Link
              href={article.url}
              title={article.title}
              className="block truncate text-base leading-6 font-bold text-on-surface hover:text-primary"
            >
              {article.title}
            </Link>
          )}
        </div>
        {article.imageUrl && !deleted && (
          <Image
            src={article.imageUrl}
            alt=""
            width={96}
            height={64}
            unoptimized
            className="h-16 w-24 shrink-0 rounded-md-sm object-cover"
          />
        )}
      </div>

      {/* 메모 영역: 기사 본문·요약처럼 읽히지 않도록 컨테이너 색을 구분 */}
      <div className="mx-3 rounded-md-md bg-tertiary-container px-4 py-3 text-on-tertiary-container">
        <MemoEditor
          scrapId={scrap.id}
          memo={scrap.memo}
          memoUpdatedLabel={scrap.memoUpdatedAt ? formatDateTime(scrap.memoUpdatedAt) : undefined}
        />
        {scrap.memoHistory.length > 0 && (
          <details className="group mt-2 text-sm">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-xs font-bold text-tertiary">
              <Icon name="history" size={16} />
              이전 메모 {scrap.memoHistory.length}개
            </summary>
            <ol className="mt-2 space-y-2">
              {scrap.memoHistory
                .slice()
                .reverse()
                .map((h) => (
                  <li key={h.savedAt} className="border-l-2 border-tertiary/40 pl-3">
                    <p className="whitespace-pre-wrap opacity-80">{h.content}</p>
                    <p className="text-xs opacity-60">{formatDateTime(h.savedAt)}</p>
                  </li>
                ))}
            </ol>
          </details>
        )}
      </div>

      {/* 스크랩 정보 · 이후 여론 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 pr-1 pl-4 text-xs text-on-surface-variant">
        <span>스크랩한 날짜 {formatDateTime(scrap.scrappedAt)}</span>
        <span className="ml-auto flex items-center gap-1">
          {deleted ? (
            <span className="inline-flex items-center gap-1 px-2">
              <Icon name="chat" size={14} />
              스크랩 이후 댓글 +{scrap.commentsSinceScrap}
            </span>
          ) : (
            <Link href={`${article.url}#comments`} className="md-btn md-btn-text h-8 gap-1 text-xs">
              <Icon name="chat" size={16} />
              스크랩 이후 댓글 +{scrap.commentsSinceScrap}
            </Link>
          )}
          <DeleteScrapButton scrapId={scrap.id} />
        </span>
      </div>
    </article>
  );
}
