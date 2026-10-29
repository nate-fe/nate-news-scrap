"use client";

import { useTransition } from "react";
import { deleteMemoRevision } from "@/lib/actions";
import { Icon } from "@/components/icon";
import { useDialog } from "@/components/dialog-provider";

// '이전 메모' 목록의 항목 하나를 지우는 버튼. 현재 메모와 스크랩은 그대로 둔다.
export function DeleteMemoRevisionButton({ scrapId, savedAt }: { scrapId: string; savedAt: string }) {
  const [pending, startTransition] = useTransition();
  const { confirm, alert } = useDialog();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label="이전 메모 삭제"
      title="이전 메모 삭제"
      onClick={async () => {
        const ok = await confirm({ message: "이 이전 메모를 삭제할까요?", confirmLabel: "삭제" });
        if (!ok) return;
        startTransition(async () => {
          const result = await deleteMemoRevision(scrapId, savedAt);
          if (!result.ok) await alert({ message: result.error });
        });
      }}
      className="md-icon-btn size-7 shrink-0"
    >
      <Icon name="close" size={16} />
    </button>
  );
}
