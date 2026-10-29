"use client";

import { useCallback, useState, useTransition } from "react";
import { createFolder, moveScrapToFolder } from "@/lib/actions";
import { FolderNameForm } from "@/components/folder-name-form";
import { useDismiss } from "@/components/scrap-popover";
import { Icon } from "@/components/icon";

export interface FolderOption {
  id: string;
  name: string;
}

// 팝업을 버튼 왼쪽 끝에 맞춰 아래로 띄운다 (카드 왼쪽 아래에 있는 버튼이라서)
const POPOVER =
  "absolute top-full left-0 z-30 mt-2 w-56 overflow-hidden rounded-[15px] border border-outline-variant bg-surface text-left shadow-elevation-3";
const MENU_ITEM =
  "flex h-11 w-full cursor-pointer items-center gap-2 px-4 text-left text-sm font-bold text-[#333] transition-colors hover:bg-on-surface/5 disabled:cursor-default disabled:opacity-40";

// 스크랩 카드의 '폴더' 버튼. 지금 담긴 폴더 이름을 보여주고, 누르면 다른 폴더로 옮기거나 새 폴더를 만들 수 있다.
export function MoveFolderButton({
  scrapId,
  currentFolderId,
  folders,
}: {
  scrapId: string;
  currentFolderId?: string;
  folders: FolderOption[];
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const current = folders.find((f) => f.id === currentFolderId);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex h-7 max-w-40 cursor-pointer items-center gap-1 rounded-full border px-2.5 text-xs font-bold ${
          current
            ? "border-transparent bg-surface-container-high text-on-surface"
            : "border-outline-variant text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <Icon name={current ? "folder" : "folderOutline"} size={14} className="shrink-0" />
        <span className="truncate">{current ? current.name : "폴더에 담기"}</span>
      </button>
      {open && (
        <MovePopover scrapId={scrapId} currentFolderId={currentFolderId} folders={folders} onClose={close} />
      )}
    </div>
  );
}

function MovePopover({
  scrapId,
  currentFolderId,
  folders,
  onClose,
}: {
  scrapId: string;
  currentFolderId?: string;
  folders: FolderOption[];
  onClose: () => void;
}) {
  const ref = useDismiss(onClose);
  const [creating, setCreating] = useState(false);
  const [pending, startTransition] = useTransition();

  const move = (folderId?: string) =>
    startTransition(async () => {
      const result = await moveScrapToFolder(scrapId, folderId);
      if (result.ok) onClose();
    });

  return (
    <div ref={ref} role="dialog" aria-label="폴더로 이동" className={POPOVER}>
      {creating ? (
        <div className="p-4">
          <p className="mb-2 text-sm font-bold text-on-surface">새 폴더 만들고 담기</p>
          <FolderNameForm
            submitLabel="만들기"
            onSubmit={(name) => createFolder(name, scrapId)}
            onCancel={() => setCreating(false)}
            onDone={onClose}
          />
        </div>
      ) : (
        <>
          <p className="px-4 pt-3 pb-1 text-xs font-bold text-on-surface-variant">폴더로 이동</p>
          <ul className="max-h-64 divide-y divide-outline-variant overflow-y-auto">
            {folders.map((f) => {
              const selected = f.id === currentFolderId;
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    disabled={pending}
                    aria-pressed={selected}
                    onClick={() => (selected ? onClose() : move(f.id))}
                    className={`${MENU_ITEM} ${selected ? "text-primary" : ""}`}
                  >
                    <Icon name="folder" size={16} className={selected ? "text-primary" : "text-on-surface-variant"} />
                    <span className="min-w-0 flex-1 truncate">{f.name}</span>
                    {selected && <Icon name="check" size={16} />}
                  </button>
                </li>
              );
            })}
            {currentFolderId && (
              <li>
                <button type="button" disabled={pending} onClick={() => move(undefined)} className={MENU_ITEM}>
                  <Icon name="close" size={16} className="text-on-surface-variant" />
                  폴더에서 빼기
                </button>
              </li>
            )}
            <li>
              <button type="button" onClick={() => setCreating(true)} className={`${MENU_ITEM} text-primary`}>
                <Icon name="add" size={16} />새 폴더
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}
