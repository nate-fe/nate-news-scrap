"use client";

import { useTransition } from "react";
import { deleteScrap } from "@/lib/actions";
import { Icon } from "@/components/icon";
import { useDialog } from "@/components/dialog-provider";

export function DeleteScrapButton({ scrapId }: { scrapId: string }) {
  const [pending, startTransition] = useTransition();
  const { confirm, alert } = useDialog();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label="스크랩 삭제"
      title="스크랩 삭제"
      onClick={async () => {
        const ok = await confirm({
          title: "스크랩 삭제",
          message: "스크랩을 삭제할까요?\n남긴 메모도 함께 삭제돼요.",
          confirmLabel: "삭제",
        });
        if (!ok) return;
        startTransition(async () => {
          const result = await deleteScrap(scrapId);
          if (!result.ok) await alert({ message: result.error });
        });
      }}
      className="md-icon-btn"
    >
      <Icon name="delete" size={20} />
    </button>
  );
}
