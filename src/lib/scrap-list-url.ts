import type { MyScrapFilter } from "@/types/scrap";

// 내 스크랩 목록 주소 만들기. 필터·페이지 상태를 URL에 남겨 새로고침·공유해도 그대로 보이게 한다.
// 필터 바(클라이언트)와 페이지 버튼(서버)이 같은 규칙을 쓴다.
// 필터를 바꿀 때는 page를 넘기지 않아 1페이지로 돌아간다.
export function scrapListHref(filter: MyScrapFilter, page = 1) {
  const sp = new URLSearchParams();
  if (filter.folder) sp.set("folder", filter.folder);
  if (filter.q?.trim()) sp.set("q", filter.q.trim());
  if (filter.press) sp.set("press", filter.press);
  if (filter.memoOnly) sp.set("memo", "1");
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/?${qs}` : "/";
}
