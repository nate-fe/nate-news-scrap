"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { deleteFolder, renameFolder } from "@/lib/actions";
import { scrapListHref } from "@/lib/scrap-list-url";
import { FolderNameForm } from "@/components/folder-name-form";
import { POPOVER_BASE, useDismiss } from "@/components/scrap-popover";
import { Icon } from "@/components/icon";
import { useDialog } from "@/components/dialog-provider";

const MENU_ITEM =
  "flex h-11 w-full cursor-pointer items-center px-4 text-left text-sm font-bold text-[#333] transition-colors hover:bg-on-surface/5 disabled:cursor-default disabled:opacity-40";

// 폴더를 열었을 때 목록 위에 뜨는 머리줄: [폴더 이름 · N개] ........ [⋯] (이름 변경 · 폴더 삭제)
export function FolderHeader({ folderId, name, count }: { folderId: string; name: string; count: number }) {
  const router = useRouter();
  const [mode, setMode] = useState<"closed" | "menu" | "rename">("closed");
  const close = useCallback(() => setMode("closed"), []);
  const [pending, startTransition] = useTransition();
  const { confirm, alert } = useDialog();

  return (
    <div className="relative mb-3 flex items-center justify-between gap-2">
      <h2 className="flex min-w-0 items-center gap-2 text-lg font-extrabold text-on-surface">
        <Icon name="folder" size={22} className="text-primary" />
        <span className="truncate">{name}</span>
        <span className="shrink-0 text-sm font-bold text-on-surface-variant">{count}개</span>
      </h2>
      <button
        type="button"
        aria-label="폴더 메뉴"
        aria-haspopup="menu"
        aria-expanded={mode !== "closed"}
        onClick={() => setMode((m) => (m === "closed" ? "menu" : "closed"))}
        className="md-icon-btn shrink-0"
      >
        <Icon name="moreVert" size={20} />
      </button>

      {mode === "menu" && (
        <Popover onClose={close} className="w-36 overflow-hidden py-1">
          <ul className="divide-y divide-outline-variant">
            <li>
              <button type="button" onClick={() => setMode("rename")} className={MENU_ITEM}>
                이름 변경
              </button>
            </li>
            <li>
              <button
                type="button"
                disabled={pending}
                onClick={async () => {
                  close();
                  const ok = await confirm({
                    title: "폴더 삭제",
                    message: `'${name}' 폴더를 삭제할까요?\n담긴 스크랩은 지워지지 않고 '모든 스크랩'에 남아요.`,
                    confirmLabel: "삭제",
                  });
                  if (!ok) return;
                  startTransition(async () => {
                    const result = await deleteFolder(folderId);
                    if (result.ok) router.replace(scrapListHref({}));
                    else await alert({ message: result.error });
                  });
                }}
                className={`${MENU_ITEM} text-primary`}
              >
                폴더 삭제
              </button>
            </li>
            <li>
              <button type="button" onClick={close} className={MENU_ITEM}>
                취소
              </button>
            </li>
          </ul>
        </Popover>
      )}

      {mode === "rename" && (
        <Popover onClose={close} className="w-64 p-4">
          <p className="mb-2 text-sm font-bold text-on-surface">폴더 이름 변경</p>
          <FolderNameForm
            initialName={name}
            submitLabel="변경"
            onSubmit={(next) => renameFolder(folderId, next)}
            onCancel={close}
            onDone={close}
          />
        </Popover>
      )}
    </div>
  );
}

function Popover({ onClose, className, children }: { onClose: () => void; className: string; children: React.ReactNode }) {
  const ref = useDismiss(onClose);
  return (
    <div ref={ref} role="dialog" className={`${POPOVER_BASE} ${className}`}>
      {children}
    </div>
  );
}
