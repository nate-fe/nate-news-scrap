import type { ArticleStatus } from "@/types/scrap";

// 기사 상태(정정·삭제)를 언론사 옆에 텍스트로 붙인다. 배경 없이 글자 색으로만 구분한다.
export function ArticleStatusText({ status }: { status: ArticleStatus }) {
  if (status === "normal") return null;
  const deleted = status === "deleted";
  return (
    <>
      <span aria-hidden>·</span>
      <span className={`font-bold ${deleted ? "text-status-deleted" : "text-status-corrected"}`}>
        {deleted ? "삭제된 기사" : "정정된 기사"}
      </span>
    </>
  );
}
