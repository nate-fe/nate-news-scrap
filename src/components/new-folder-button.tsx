"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { createFolder } from "@/lib/actions";
import { scrapListHref } from "@/lib/scrap-list-url";
import { FolderNameForm } from "@/components/folder-name-form";
import { POPOVER_BASE, useDismiss } from "@/components/scrap-popover";
import { Icon } from "@/components/icon";

// 폴더 줄 오른쪽 위 '+ 새 폴더'. 만들면 그 폴더 화면으로 이동한다.
export function NewFolderButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-8 cursor-pointer items-center gap-0.5 rounded-full pr-3 pl-2 text-sm font-bold text-primary hover:bg-primary/8"
      >
        <Icon name="add" size={18} />새 폴더
      </button>
      {open && (
        <NewFolderPopover
          onClose={close}
          onCreated={(folderId) => {
            close();
            router.push(scrapListHref({ folder: folderId }));
          }}
        />
      )}
    </div>
  );
}

function NewFolderPopover({ onClose, onCreated }: { onClose: () => void; onCreated: (folderId: string) => void }) {
  const ref = useDismiss(onClose);
  return (
    <div ref={ref} role="dialog" aria-label="새 폴더" className={`${POPOVER_BASE} w-64 p-4`}>
      <p className="mb-2 text-sm font-bold text-on-surface">새 폴더</p>
      <FolderNameForm submitLabel="만들기" onSubmit={(name) => createFolder(name)} onCancel={onClose} onDone={onCreated} />
    </div>
  );
}
