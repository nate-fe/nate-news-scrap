"use server";

import { refresh } from "next/cache";
import { getStore } from "@/lib/store";
import { CURRENT_USER_ID, MEMO_MAX_LENGTH } from "@/lib/config";

// 스크랩 변경 Server Action. 실제 인증이 붙으면 CURRENT_USER_ID 대신 세션 사용자로 확인한다.

export type ActionResult = { ok: true } | { ok: false; error: string };

function readMemo(formData: FormData): string | { error: string } {
  const memo = String(formData.get("memo") ?? "").trim();
  if (memo.length > MEMO_MAX_LENGTH) {
    return { error: `메모는 ${MEMO_MAX_LENGTH}자까지 쓸 수 있어요.` };
  }
  return memo;
}

export async function createScrap(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const articleId = String(formData.get("articleId") ?? "");
  const store = getStore();
  const article = store.articles.find((a) => a.id === articleId);
  if (!article) return { ok: false, error: "기사를 찾을 수 없어요." };
  if (article.status === "deleted") return { ok: false, error: "삭제된 기사는 스크랩할 수 없어요." };
  if (store.scraps.some((s) => s.userId === CURRENT_USER_ID && s.articleId === articleId)) {
    return { ok: false, error: "이미 스크랩한 기사예요." };
  }

  const memo = readMemo(formData);
  if (typeof memo !== "string") return { ok: false, error: memo.error };

  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  store.scraps.push({
    id: `s${now}`,
    userId: CURRENT_USER_ID,
    articleId,
    scrappedAt: nowIso,
    memo: memo || undefined,
    memoUpdatedAt: memo ? nowIso : undefined,
    memoHistory: [],
  });

  refresh();
  return { ok: true };
}

export async function updateMemo(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const scrapId = String(formData.get("scrapId") ?? "");
  const scrap = getStore().scraps.find((s) => s.id === scrapId && s.userId === CURRENT_USER_ID);
  if (!scrap) return { ok: false, error: "스크랩을 찾을 수 없어요." };

  const memo = readMemo(formData);
  if (typeof memo !== "string") return { ok: false, error: memo.error };
  if (memo === (scrap.memo ?? "")) return { ok: true };

  // "그때 생각과 지금 생각"을 비교할 수 있도록 이전 메모를 이력에 남긴다
  if (scrap.memo && scrap.memoUpdatedAt) {
    scrap.memoHistory.push({ content: scrap.memo, savedAt: scrap.memoUpdatedAt });
  }
  scrap.memo = memo || undefined;
  scrap.memoUpdatedAt = new Date().toISOString();

  refresh();
  return { ok: true };
}

export async function deleteScrap(scrapId: string): Promise<ActionResult> {
  const store = getStore();
  const idx = store.scraps.findIndex((s) => s.id === scrapId && s.userId === CURRENT_USER_ID);
  if (idx === -1) return { ok: false, error: "스크랩을 찾을 수 없어요." };
  store.scraps.splice(idx, 1);
  refresh();
  return { ok: true };
}
