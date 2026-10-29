"use client";

import { useState, useTransition } from "react";
import { FOLDER_NAME_MAX_LENGTH } from "@/lib/config";
import type { FolderResult } from "@/lib/actions";

// 폴더 이름 입력 양식. 새 폴더 만들기 · 이름 변경 · '폴더로 이동'의 새 폴더에서 함께 쓴다.
export function FolderNameForm({
  initialName = "",
  submitLabel,
  onSubmit,
  onCancel,
  onDone,
}: {
  initialName?: string;
  submitLabel: string;
  onSubmit: (name: string) => Promise<FolderResult>;
  onCancel: () => void;
  onDone: (folderId: string) => void;
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await onSubmit(name);
          if (result.ok) onDone(result.folderId);
          else setError(result.error);
        });
      }}
    >
      <input
        autoFocus
        value={name}
        maxLength={FOLDER_NAME_MAX_LENGTH}
        onChange={(e) => {
          setName(e.target.value);
          setError(undefined);
        }}
        placeholder="폴더 이름"
        aria-label="폴더 이름"
        className="md-field h-10 w-full px-3 text-sm"
      />
      <p className="mt-1 flex justify-between gap-2 text-xs">
        <span className="text-error">{error}</span>
        <span className="text-on-surface-variant tabular-nums">
          {name.length}/{FOLDER_NAME_MAX_LENGTH}
        </span>
      </p>
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-9 cursor-pointer items-center rounded-full px-3 text-sm font-bold text-[#333] hover:bg-on-surface/8"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={pending || !name.trim()}
          className="inline-flex h-9 cursor-pointer items-center rounded-full bg-primary px-4 text-sm font-bold text-on-primary disabled:cursor-default disabled:opacity-40"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
