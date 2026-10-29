// 도메인 타입 정의 (기획서 "PoC 기능 범위", "스크랩 카드 UI" 기준)

/** 원문 상태. 삭제·정정되면 스크랩 카드에도 그대로 반영한다. */
export type ArticleStatus = "normal" | "corrected" | "deleted";

export interface Article {
  id: string;
  /** 원문 제목 그대로. 사용자가 수정할 수 없다. */
  title: string;
  pressName: string;
  url: string;
  /** 대표 이미지. 기사에 있을 때만. */
  imageUrl?: string;
  status: ArticleStatus;
  publishedAt: string; // ISO
}

/** 댓글은 기사에 귀속된다. 스크랩에 저장하지 않고 조회만 한다. */
export interface Comment {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: string; // ISO
  /** 삭제·임시조치된 댓글은 "이후 댓글 수"에서도 빠진다. */
  hidden: boolean;
}

export interface MemoRevision {
  content: string;
  savedAt: string; // ISO
}

/** 스크랩과 메모는 사람에 귀속되며, PoC에서는 모두 비공개다. */
export interface Scrap {
  id: string;
  userId: string;
  articleId: string;
  scrappedAt: string; // ISO
  memo?: string;
  memoUpdatedAt?: string; // ISO
  /** 메모 수정 이력 (선택 기능). 수정 직전 내용을 쌓는다. */
  memoHistory: MemoRevision[];
}

/** 내 스크랩함 카드에 쓰는 조합 데이터 */
export interface ScrapWithArticle extends Scrap {
  article: Article;
  /** 스크랩 이후 달린 댓글 수 (조회 시점 계산) */
  commentsSinceScrap: number;
}

export interface MyScrapFilter {
  q?: string;
  press?: string;
  memoOnly?: boolean;
}

/** 스크랩 모음 메인: 기사 단위 익명 집계 */
export interface ArticleScrapStat {
  article: Article;
  scrapCount: number;
  /** 스크랩 시점 대비 평균 댓글 증가량 */
  avgCommentsSinceScrap: number;
}

export type RankingPeriod = "24h" | "7d";
