"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { createScrap, deleteScrap, type ActionResult } from "@/lib/actions";
import { MEMO_MAX_LENGTH } from "@/lib/config";
import { Icon } from "@/components/icon";
import type { FolderOption } from "@/components/move-folder-button";

// 기사 상단 아이콘·댓글 머리줄의 '스크랩하기'·'스크랩됨' 버튼 아래에 뜨는 작은 레이어 팝업.
// 배경을 어둡게 하지 않고, 바깥을 누르거나 Esc를 누르면 닫힌다.

/** 스크랩 팝업 버튼: 취소는 #333 글자, 주 버튼은 포인트 컬러 */
const BTN = "inline-flex h-9 cursor-pointer items-center justify-center rounded-full px-4 text-sm font-bold whitespace-nowrap transition-colors disabled:cursor-default disabled:opacity-40";
const CANCEL_BTN = `${BTN} px-3 text-[#333] hover:bg-on-surface/8`;
const PRIMARY_BTN = `${BTN} bg-primary text-on-primary hover:brightness-95`;

/** 팝업 위치·모양 공통 (너비·안쪽 여백은 팝업마다 따로) */
export const POPOVER_BASE =
  "absolute top-full right-0 z-30 mt-2 rounded-[15px] border border-outline-variant bg-surface text-left shadow-elevation-3";
const POPOVER_CLASS = `${POPOVER_BASE} w-[min(20rem,calc(100vw-1.5rem))] p-4`;

/** 팝업 바깥을 누르거나 Esc를 누르면 닫는다. 팝업과 여는 버튼을 같은 부모 안에 둔다. */
export function useDismiss(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      // 팝업을 연 버튼은 부모(댓글 머리줄) 안에 있으므로, 그 영역 밖을 눌렀을 때만 닫는다
      const area = ref.current?.parentElement;
      if (area && !area.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);
  return ref;
}

/** 스크랩 저장: 메모 입력(선택) + 글자 수 + [취소] [스크랩] */
export function ScrapPopover({
  articleId,
  folders = [],
  onClose,
}: {
  articleId: string;
  /** 스크랩하면서 담을 폴더 선택지 (선택) */
  folders?: FolderOption[];
  onClose: () => void;
}) {
  const ref = useDismiss(onClose);
  const [memo, setMemo] = useState("");
  const [state, formAction, pending] = useActionState(async (prev: ActionResult | null, fd: FormData) => {
    const result = await createScrap(prev, fd);
    if (result.ok) onClose();
    return result;
  }, null);

  return (
    <div ref={ref} role="dialog" aria-label="스크랩하기" className={POPOVER_CLASS}>
      <form action={formAction}>
        <input type="hidden" name="articleId" value={articleId} />
        <label
          htmlFor={`scrap-memo-${articleId}`}
          className="mb-2 flex items-center gap-1 text-sm font-bold text-on-surface"
        >
          <Icon name="lock" size={16} className="text-on-surface-variant" />
          메모 (선택)
        </label>
        <textarea
          id={`scrap-memo-${articleId}`}
          name="memo"
          rows={2}
          autoFocus
          maxLength={MEMO_MAX_LENGTH}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="md-field h-auto w-full resize-none px-3 py-2.5 text-sm leading-6"
        />
        <p className="mt-1 text-right text-xs text-on-surface-variant tabular-nums">
          {memo.length}/{MEMO_MAX_LENGTH}
        </p>
        {folders.length > 0 && (
          // 메모와 같은 형태: 윗줄에 '폴더' 이름, 다음 줄에 선택 칸을 꽉 채워 둔다
          <div className="mt-2">
            <label
              htmlFor={`scrap-folder-${articleId}`}
              className="mb-2 flex items-center gap-1 text-sm font-bold text-on-surface"
            >
              <Icon name="folder" size={16} className="text-on-surface-variant" />
              폴더
            </label>
            <select
              id={`scrap-folder-${articleId}`}
              name="folderId"
              defaultValue=""
              className="md-field block h-10 w-full px-3 text-sm"
            >
              <option value="">선택 안 함</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {state && !state.ok && <p className="mt-1 text-xs text-error">{state.error}</p>}
        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={CANCEL_BTN}>
            취소
          </button>
          <button type="submit" disabled={pending} className={`${PRIMARY_BTN} px-5`}>
            스크랩
          </button>
        </div>
      </form>
    </div>
  );
}

/** 이미 스크랩한 기사: 목록형 메뉴 (내 스크랩 보기 · 스크랩 해제 · 취소). '내 스크랩 보기'만 포인트 컬러. */
const MENU_ITEM =
  "flex h-11 w-full cursor-pointer items-center px-4 text-left text-sm font-bold text-[#333] transition-colors hover:bg-on-surface/5 disabled:cursor-default disabled:opacity-40";

export function UnscrapPopover({ scrapId, onClose }: { scrapId: string; onClose: () => void }) {
  const ref = useDismiss(onClose);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div ref={ref} role="dialog" aria-label="스크랩 메뉴" className={`${POPOVER_BASE} w-36 overflow-hidden py-1`}>
      <ul className="divide-y divide-outline-variant">
        <li>
          {/* 스크랩 페이지(내 스크랩)로 이동 */}
          <Link href="/" className={`${MENU_ITEM} text-primary`}>
            내 스크랩 보기
          </Link>
        </li>
        <li>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteScrap(scrapId);
                if (result.ok) onClose();
                else setError(result.error);
              })
            }
            className={MENU_ITEM}
          >
            스크랩 해제
          </button>
        </li>
      </ul>
      {error && <p className="px-4 py-2 text-xs text-error">{error}</p>}
    </div>
  );
}
