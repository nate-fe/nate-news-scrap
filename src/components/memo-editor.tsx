"use client";

import { useActionState, useState } from "react";
import { updateMemo } from "@/lib/actions";
import { MEMO_MAX_LENGTH } from "@/lib/config";
import { Icon } from "@/components/icon";

interface Props {
  scrapId: string;
  memo?: string;
  memoUpdatedLabel?: string;
}

function MemoLabel() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-tertiary">
      <Icon name="lock" size={14} />내 메모
    </span>
  );
}

export function MemoEditor({ scrapId, memo, memoUpdatedLabel }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(memo ?? "");
  const [state, formAction, pending] = useActionState(
    async (prev: Awaited<ReturnType<typeof updateMemo>> | null, fd: FormData) => {
      const result = await updateMemo(prev, fd);
      if (result.ok) setEditing(false);
      return result;
    },
    null,
  );

  if (!editing) {
    return (
      <div>
        <div className="-mr-2 mb-1 flex items-center justify-between">
          <MemoLabel />
          <button
            type="button"
            onClick={() => {
              setDraft(memo ?? "");
              setEditing(true);
            }}
            className="md-btn md-btn-text h-8 gap-1 px-2 text-xs text-tertiary"
          >
            <Icon name="edit" size={16} />
            {memo ? "수정" : "메모 쓰기"}
          </button>
        </div>
        {memo ? (
          <p className="text-sm leading-6 whitespace-pre-wrap">{memo}</p>
        ) : (
          <p className="text-sm opacity-60">아직 메모가 없어요.</p>
        )}
        {memoUpdatedLabel && <p className="mt-1 text-xs opacity-60">메모 수정 {memoUpdatedLabel}</p>}
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="scrapId" value={scrapId} />
      <label className="mb-2 block" htmlFor={`memo-${scrapId}`}>
        <MemoLabel />
      </label>
      <textarea
        id={`memo-${scrapId}`}
        name="memo"
        rows={4}
        maxLength={MEMO_MAX_LENGTH}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="md-field h-auto w-full bg-surface-container-lowest py-3 text-sm leading-6"
      />
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="pl-4 opacity-60">
          {draft.length}/{MEMO_MAX_LENGTH}
        </span>
        <span className="flex gap-2">
          <button type="button" onClick={() => setEditing(false)} className="md-btn md-btn-text">
            취소
          </button>
          <button type="submit" disabled={pending} className="md-btn md-btn-filled">
            저장
          </button>
        </span>
      </div>
      {state && !state.ok && <p className="mt-1 pl-4 text-xs text-error">{state.error}</p>}
    </form>
  );
}
