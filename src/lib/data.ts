import "server-only";
import { connection } from "next/server";
import { getStore } from "@/lib/store";
import { CURRENT_USER_ID, MIN_SCRAP_COUNT, RANKING_SIZE } from "@/lib/config";
import type {
  Article,
  ArticleScrapStat,
  Comment,
  MyScrapFilter,
  RankingPeriod,
  Scrap,
  ScrapWithArticle,
} from "@/types/scrap";

// 데이터 조회 계층. 스크랩은 비공개·개인 데이터이고 댓글 수는 실시간 조회라서
// 모든 함수가 요청 시점에 실행되도록 connection()을 먼저 호출한다.

const HOUR = 60 * 60 * 1000;

/**
 * 스크랩 이후 달린 댓글 수.
 * 스냅샷이 아닌 조회 방식이라 삭제·임시조치된 댓글이 그대로 반영된다.
 */
function countCommentsSince(articleId: string, since: string): number {
  const t = Date.parse(since);
  return getStore().comments.filter(
    (c) => c.articleId === articleId && !c.hidden && Date.parse(c.createdAt) > t,
  ).length;
}

function findArticle(id: string): Article | undefined {
  return getStore().articles.find((a) => a.id === id);
}

export async function getArticle(id: string): Promise<Article | undefined> {
  await connection();
  return findArticle(id);
}

export async function getVisibleComments(articleId: string): Promise<Comment[]> {
  await connection();
  return getStore()
    .comments.filter((c) => c.articleId === articleId && !c.hidden)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getMyScrapForArticle(articleId: string): Promise<Scrap | undefined> {
  await connection();
  return getStore().scraps.find((s) => s.userId === CURRENT_USER_ID && s.articleId === articleId);
}

export async function getMyScraps(filter: MyScrapFilter = {}): Promise<ScrapWithArticle[]> {
  await connection();
  const q = filter.q?.trim().toLowerCase();

  return getStore()
    .scraps.filter((s) => s.userId === CURRENT_USER_ID)
    .flatMap((s): ScrapWithArticle[] => {
      const article = findArticle(s.articleId);
      if (!article) return [];
      return [{ ...s, article, commentsSinceScrap: countCommentsSince(s.articleId, s.scrappedAt) }];
    })
    .filter((s) => {
      if (filter.press && s.article.pressName !== filter.press) return false;
      if (filter.memoOnly && !s.memo) return false;
      if (q) {
        const inTitle = s.article.title.toLowerCase().includes(q);
        const inMemo = s.memo?.toLowerCase().includes(q) ?? false;
        if (!inTitle && !inMemo) return false;
      }
      return true;
    })
    .sort((a, b) => b.scrappedAt.localeCompare(a.scrappedAt));
}

/** 내 스크랩함 필터용 언론사 목록 */
export async function getMyPressNames(): Promise<string[]> {
  await connection();
  const { scraps } = getStore();
  const names = scraps
    .filter((s) => s.userId === CURRENT_USER_ID)
    .map((s) => findArticle(s.articleId)?.pressName)
    .filter((n): n is string => !!n);
  return [...new Set(names)].sort();
}

/**
 * 기사 단위 익명 집계. 누가 스크랩했는지는 드러내지 않는다.
 * - 삭제된 기사 제외
 * - 최소 스크랩 수 미만 기사 제외
 */
function aggregate(sinceMs?: number): ArticleScrapStat[] {
  const { scraps } = getStore();
  const byArticle = new Map<string, Scrap[]>();
  for (const s of scraps) {
    if (sinceMs !== undefined && Date.parse(s.scrappedAt) < sinceMs) continue;
    const list = byArticle.get(s.articleId) ?? [];
    list.push(s);
    byArticle.set(s.articleId, list);
  }

  const stats: ArticleScrapStat[] = [];
  for (const [articleId, list] of byArticle) {
    const article = findArticle(articleId);
    if (!article || article.status === "deleted") continue;
    if (list.length < MIN_SCRAP_COUNT) continue;
    const total = list.reduce((sum, s) => sum + countCommentsSince(articleId, s.scrappedAt), 0);
    stats.push({ article, scrapCount: list.length, avgCommentsSinceScrap: total / list.length });
  }
  return stats;
}

/** 많이 스크랩된 기사 (최근 24시간 / 7일) */
export async function getMostScrapped(period: RankingPeriod): Promise<ArticleScrapStat[]> {
  await connection();
  const windowMs = (period === "24h" ? 24 : 24 * 7) * HOUR;
  return aggregate(Date.now() - windowMs)
    .sort((a, b) => b.scrapCount - a.scrapCount)
    .slice(0, RANKING_SIZE);
}

/** 스크랩 이후 여론이 뜨거워진 기사 */
export async function getHeatedAfterScrap(): Promise<ArticleScrapStat[]> {
  await connection();
  return aggregate()
    .filter((s) => s.avgCommentsSinceScrap > 0)
    .sort((a, b) => b.avgCommentsSinceScrap - a.avgCommentsSinceScrap)
    .slice(0, RANKING_SIZE);
}
