"use client";

import { useCallback, useState } from "react";
import { ScrapPopover, UnscrapPopover } from "@/components/scrap-popover";
import { Icon } from "@/components/icon";

// 네이트 뉴스 기사 댓글 영역의 머리줄.
// [댓글 N] ............ [스크랩하기] | [MY댓글 >]
// 기존 'MY댓글' 바로 왼쪽에 '스크랩하기'를 붙인다. 누르면 버튼 아래에 작은 레이어 팝업이 뜬다.
// 이미 스크랩한 기사는 '스크랩됨'으로 보이고, 누르면 스크랩을 해제할 수 있다.
export function CommentScrapHeader({
  articleId,
  commentCount,
  scrapId,
}: {
  articleId: string;
  commentCount: number;
  /** 내가 이 기사를 스크랩했으면 그 스크랩 id */
  scrapId?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const scrapped = !!scrapId;

  return (
    // 팝업은 머리줄 오른쪽 끝에 맞춰 띄운다 (좁은 화면에서도 카드 밖으로 나가지 않게)
    <div className="relative mb-3 flex items-center justify-between gap-3">
      <h2 className="text-lg font-extrabold">
        댓글 <span className="text-primary">{commentCount}</span>
      </h2>
      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex cursor-pointer items-center gap-1 font-bold text-primary"
        >
          <Icon name={scrapped ? "bookmark" : "bookmarkBorder"} size={16} />
          {scrapped ? "스크랩됨" : "스크랩하기"}
        </button>
        <span aria-hidden className="h-3 w-px bg-outline-variant" />
        {/* 기존 네이트 뉴스 기능 자리 (목업) */}
        <span className="flex items-center text-on-surface-variant">
          MY댓글
          <Icon name="chevronRight" size={16} />
        </span>
      </div>
      {open &&
        (scrapped ? (
          <UnscrapPopover scrapId={scrapId} onClose={close} />
        ) : (
          <ScrapPopover articleId={articleId} onClose={close} />
        ))}
    </div>
  );
}
