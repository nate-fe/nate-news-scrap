"use client";

import { useCallback, useState } from "react";
import { ScrapPopover, UnscrapPopover } from "@/components/scrap-popover";
import { Icon } from "@/components/icon";
import type { FolderOption } from "@/components/move-folder-button";
import { ARTICLE_TOOL_BUTTON } from "@/components/article-tool-button";

// 기사 상단 아이콘 줄의 '스크랩하기' 아이콘 버튼. 기존 'AI요약' 바로 왼쪽에 둔다.
// 누르면 버튼 아래에 작은 레이어 팝업(메모 입력)이 뜨고, 이미 스크랩했으면 해제 팝업이 뜬다.
// 팝업은 아이콘 줄(relative) 오른쪽 끝에 맞춰 뜬다.
export function ScrapIconButton({
  articleId,
  scrapId,
  folders,
}: {
  articleId: string;
  scrapId?: string;
  folders: FolderOption[];
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const scrapped = !!scrapId;
  const label = scrapped ? "스크랩됨" : "스크랩하기";

  return (
    <>
      <button
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`${ARTICLE_TOOL_BUTTON} cursor-pointer ${scrapped ? "text-primary" : "hover:text-primary"}`}
      >
        <Icon name={scrapped ? "bookmark" : "bookmarkBorder"} size={20} />
      </button>
      {open &&
        (scrapped ? (
          <UnscrapPopover scrapId={scrapId} onClose={close} />
        ) : (
          <ScrapPopover articleId={articleId} folders={folders} onClose={close} />
        ))}
    </>
  );
}
