import type { Article, Comment, Scrap, ScrapFolder } from "@/types/scrap";
import { CURRENT_USER_ID } from "@/lib/config";
import { mockCommentAuthor, mockCommentContent } from "@/lib/mock/comments";

// PoC 목업 데이터. 시각은 서버가 처음 데이터를 만든 시점 기준 상대값으로 만든다.

const HOUR = 60 * 60 * 1000;

function hoursAgo(now: number, h: number) {
  return new Date(now - h * HOUR).toISOString();
}

type ArticleSeed = Omit<Article, "url" | "publishedAt"> & {
  publishedHoursAgo: number;
  /** [댓글 수, 처음 댓글 몇 시간 전, 마지막 댓글 몇 시간 전] */
  comments: [count: number, fromHoursAgo: number, toHoursAgo: number];
};

const ARTICLE_SEEDS: ArticleSeed[] = [
  {
    id: "a1",
    title: "국회, 내년도 예산안 심사 돌입…쟁점은 지역화폐·R&D",
    pressName: "네이트일보",
    imageUrl: "/mock/assembly.svg",
    status: "normal",
    publishedHoursAgo: 150,
    comments: [420, 149, 1],
  },
  {
    id: "a2",
    title: "기준금리 3회 연속 동결…\"물가 경로 더 지켜봐야\"",
    pressName: "경제타임즈",
    status: "normal",
    publishedHoursAgo: 60,
    comments: [180, 59, 2],
  },
  {
    id: "a3",
    title: "생성형 AI 저작권 가이드라인 초안 공개",
    pressName: "테크데일리",
    imageUrl: "/mock/ai-workspace.svg",
    status: "corrected",
    publishedHoursAgo: 30,
    comments: [95, 29, 0.5],
  },
  {
    id: "a4",
    title: "수도권 전세가율 2년 만에 반등",
    pressName: "네이트일보",
    status: "normal",
    publishedHoursAgo: 20,
    comments: [60, 19, 1],
  },
  {
    id: "a5",
    title: "중학교 무상급식 단가 인상 논의 본격화",
    pressName: "사회신문",
    status: "deleted",
    publishedHoursAgo: 100,
    comments: [40, 99, 50],
  },
  {
    id: "a6",
    title: "유럽 주요국, 에너지 가격 상한제 연장 합의",
    pressName: "월드뉴스",
    imageUrl: "/mock/wind-farm.svg",
    status: "normal",
    publishedHoursAgo: 12,
    comments: [35, 11, 0.2],
  },
  {
    id: "a7",
    title: "가을야구 최종전, 9회말 끝내기로 우승 확정",
    pressName: "스포츠투데이",
    status: "normal",
    publishedHoursAgo: 8,
    comments: [300, 7.9, 0.1],
  },
  {
    id: "a8",
    title: "인기 배우 A씨, 차기작 출연 확정",
    pressName: "연예통신",
    status: "normal",
    publishedHoursAgo: 5,
    comments: [130, 4.9, 0.1],
  },
  // ---- 랭킹 페이징 확인용 (최근 24시간에 스크랩이 몰린 기사들) ----
  ...(
    [
      ["a9", "반도체 수출 14개월 연속 증가…역대 최대 실적 전망", "경제타임즈", 140],
      ["a10", "대중교통 정기권 이용자 300만 명 돌파", "사회신문", 90],
      ["a11", "국내 첫 상용 양자컴퓨터 서비스 개시", "테크데일리", 75],
      ["a12", "미 대선 앞두고 주요 경합주 여론조사 박빙", "월드뉴스", 120],
      ["a13", "청년 월세 지원 대상 확대…소득 기준 완화", "네이트일보", 60],
      ["a14", "국가대표 축구팀, 평가전서 3-1 역전승", "스포츠투데이", 210],
      ["a15", "OTT 오리지널 드라마, 글로벌 1위 등극", "연예통신", 85],
      ["a16", "전기요금 4분기 동결 결정", "경제타임즈", 50],
    ] as const
  ).map(
    ([id, title, pressName, commentCount]): ArticleSeed => ({
      id,
      title,
      pressName,
      status: "normal",
      publishedHoursAgo: 23,
      comments: [commentCount, 22, 0.3],
    }),
  ),
  // ---- '스크랩 하는 법' 안내용 기사 (아무도 스크랩하지 않은 상태로 시작) ----
  {
    id: "a17",
    title: "수도권 신규 공공택지 7만 호 공급…청년·신혼부부 물량 확대",
    pressName: "네이트일보",
    status: "normal",
    publishedHoursAgo: 3,
    comments: [152, 2.9, 0.05],
  },
];

function makeComments(articleId: string, now: number, [count, from, to]: ArticleSeed["comments"]): Comment[] {
  const comments: Comment[] = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? from : from - ((from - to) * i) / (count - 1);
    comments.push({
      id: `${articleId}-c${i + 1}`,
      articleId,
      authorName: mockCommentAuthor(articleId, i),
      // 최신 댓글(뒤쪽 i)부터 기사 주제 댓글이 먼저 보이도록 역순으로 고른다
      content: mockCommentContent(articleId, count - 1 - i),
      createdAt: hoursAgo(now, t),
      // 일부는 삭제·임시조치된 상태
      hidden: i % 13 === 5,
    });
  }
  return comments;
}

export interface SeedData {
  articles: Article[];
  comments: Comment[];
  scraps: Scrap[];
  folders: ScrapFolder[];
}

export function createSeed(now = Date.now()): SeedData {
  const articles: Article[] = ARTICLE_SEEDS.map((seed) => {
    const { publishedHoursAgo, comments, ...a } = seed;
    void comments; // 댓글은 아래에서 별도로 만든다
    return { ...a, url: `/articles/${a.id}`, publishedAt: hoursAgo(now, publishedHoursAgo) };
  });

  const comments = ARTICLE_SEEDS.flatMap((a) => makeComments(a.id, now, a.comments));

  let seq = 0;
  const scrap = (
    userId: string,
    articleId: string,
    scrappedHoursAgo: number,
    extra: Partial<Scrap> = {},
  ): Scrap => ({
    id: `s${++seq}`,
    userId,
    articleId,
    scrappedAt: hoursAgo(now, scrappedHoursAgo),
    memoHistory: [],
    ...extra,
    memoCreatedAt: extra.memo ? (extra.memoHistory?.[0]?.savedAt ?? extra.memoUpdatedAt) : undefined,
  });

  // 다른 사용자들의 스크랩 (메인 페이지 익명 집계용)
  const others: Array<[articleId: string, hoursAgoList: number[]]> = [
    ["a1", [148, 140, 120, 100, 80, 30, 20, 10, 5]],
    ["a2", [58, 50, 40, 30]],
    ["a3", [28, 20, 15, 10, 6, 3]],
    ["a4", [18, 2]], // 최소 스크랩 수 미만 → 메인 미노출
    ["a5", [90, 80, 70]], // 삭제된 기사 → 집계 제외
    ["a6", [10, 8, 4, 1]],
    ["a7", [7, 6.5, 6, 5, 4, 3, 2]],
    ["a8", [4, 3, 2, 1]],
    ["a9", [21, 18, 15, 12, 9, 6, 3]],
    ["a10", [20, 16, 12, 8]],
    ["a11", [19, 14, 10, 7, 4, 2]],
    ["a12", [22, 17, 11, 5, 1]],
    ["a13", [18, 13, 9]],
    ["a14", [16, 12, 8, 6, 4, 3, 2, 1]],
    ["a15", [10, 8, 6, 4, 2]],
    ["a16", [15, 9, 4]],
  ];
  const otherScraps = others.flatMap(([articleId, list]) =>
    list.map((h, i) => scrap(`u${i + 1}`, articleId, h)),
  );

  // 내 스크랩
  const myScraps: Scrap[] = [
    scrap(CURRENT_USER_ID, "a1", 140, {
      memo: "지역화폐 예산이 최종적으로 얼마나 깎이는지 확인하기. 작년엔 결국 증액됐음.",
      memoUpdatedAt: hoursAgo(now, 26),
      memoHistory: [{ content: "지역화폐 예산 어떻게 되는지 보기", savedAt: hoursAgo(now, 140) }],
    }),
    scrap(CURRENT_USER_ID, "a3", 25, {
      memo: "가이드라인 확정본 나오면 초안이랑 비교해보자.",
      memoUpdatedAt: hoursAgo(now, 25),
    }),
    scrap(CURRENT_USER_ID, "a5", 95, {
      memo: "우리 동네 학교도 해당되는지 궁금.",
      memoUpdatedAt: hoursAgo(now, 95),
    }),
    scrap(CURRENT_USER_ID, "a7", 7.5),
    scrap(CURRENT_USER_ID, "a2", 45),
    // ---- 페이징 확인용 (10개 단위) ----
    scrap(CURRENT_USER_ID, "a4", 19, {
      memo: "내년 전세 재계약 전에 한 번 더 확인.",
      memoUpdatedAt: hoursAgo(now, 19),
    }),
    scrap(CURRENT_USER_ID, "a6", 11),
    scrap(CURRENT_USER_ID, "a8", 4.5),
    scrap(CURRENT_USER_ID, "a9", 20, {
      memo: "반도체 빼고 나머지 수출 품목은 어떤지 같이 보기.",
      memoUpdatedAt: hoursAgo(now, 20),
    }),
    scrap(CURRENT_USER_ID, "a10", 17),
    scrap(CURRENT_USER_ID, "a11", 13, {
      memo: "실제 어디에 먼저 쓰이는지 후속 기사 나오면 비교.",
      memoUpdatedAt: hoursAgo(now, 12),
    }),
    scrap(CURRENT_USER_ID, "a12", 21),
    scrap(CURRENT_USER_ID, "a13", 15, {
      memo: "동생한테 신청 대상인지 알려주기.",
      memoUpdatedAt: hoursAgo(now, 15),
    }),
    scrap(CURRENT_USER_ID, "a14", 9),
    scrap(CURRENT_USER_ID, "a15", 6),
    scrap(CURRENT_USER_ID, "a16", 14),
  ];

  // 내 스크랩 폴더 (인스타그램 '저장됨'의 컬렉션처럼 분류)
  const folders: ScrapFolder[] = [
    { id: "f1", userId: CURRENT_USER_ID, name: "부동산·경제", createdAt: hoursAgo(now, 160) },
    { id: "f2", userId: CURRENT_USER_ID, name: "IT·과학", createdAt: hoursAgo(now, 150) },
    { id: "f3", userId: CURRENT_USER_ID, name: "나중에 다시 볼 기사", createdAt: hoursAgo(now, 140) },
  ];
  const folderOf: Record<string, string> = {
    a2: "f1", a4: "f1", a9: "f1", a13: "f1", a16: "f1",
    a3: "f2", a11: "f2",
    a1: "f3", a7: "f3", a12: "f3",
  };
  for (const s of myScraps) s.folderId = folderOf[s.articleId];

  return { articles, comments, scraps: [...otherScraps, ...myScraps], folders };
}
