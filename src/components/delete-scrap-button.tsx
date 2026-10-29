"use client";

import { useTransition } from "react";
import { deleteScrap } from "@/lib/actions";
import { Icon } from "@/components/icon";

export function DeleteScrapButton({ scrapId }: { scrapId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label="스크랩 삭제"
      title="스크랩 삭제"
      onClick={() => {
        if (!confirm("스크랩을 삭제할까요? 메모도 함께 삭제돼요.")) return;
        startTransition(async () => {
          await deleteScrap(scrapId);
        });
      }}
      className="md-icon-btn"
    >
      <Icon name="delete" size={20} />
    </button>
  );
}
