"use server";

import { refresh } from "next/cache";
import { getStore } from "@/lib/store";
import { CURRENT_USER_ID, FOLDER_NAME_MAX_LENGTH, MEMO_MAX_LENGTH } from "@/lib/config";

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

  // 스크랩하면서 폴더를 고를 수 있다 (선택). 내 폴더가 아니면 무시한다.
  const folderId = String(formData.get("folderId") ?? "");
  const folder = store.folders.find((f) => f.id === folderId && f.userId === CURRENT_USER_ID);

  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  store.scraps.push({
    id: `s${now}`,
    userId: CURRENT_USER_ID,
    articleId,
    scrappedAt: nowIso,
    memo: memo || undefined,
    memoCreatedAt: memo ? nowIso : undefined,
    memoUpdatedAt: memo ? nowIso : undefined,
    memoHistory: [],
    folderId: folder?.id,
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
  const nowIso = new Date().toISOString();
  if (!memo) {
    // 메모를 비우면 '처음 작성일'도 지운다. 다음에 다시 쓰면 그때가 새 작성일.
    scrap.memo = undefined;
    scrap.memoCreatedAt = undefined;
  } else {
    if (!scrap.memo) scrap.memoCreatedAt = nowIso;
    scrap.memo = memo;
  }
  scrap.memoUpdatedAt = nowIso;

  refresh();
  return { ok: true };
}

/** 이전 메모(수정 이력) 하나 지우기. savedAt으로 찾는다. */
export async function deleteMemoRevision(scrapId: string, savedAt: string): Promise<ActionResult> {
  const scrap = getStore().scraps.find((s) => s.id === scrapId && s.userId === CURRENT_USER_ID);
  if (!scrap) return { ok: false, error: "스크랩을 찾을 수 없어요." };
  const before = scrap.memoHistory.length;
  scrap.memoHistory = scrap.memoHistory.filter((h) => h.savedAt !== savedAt);
  if (scrap.memoHistory.length === before) return { ok: false, error: "이전 메모를 찾을 수 없어요." };
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

// ---------- 스크랩 폴더 ----------

export type FolderResult = { ok: true; folderId: string } | { ok: false; error: string };

function readFolderName(raw: string, exceptId?: string): string | { error: string } {
  const name = raw.trim();
  if (!name) return { error: "폴더 이름을 입력해 주세요." };
  if (name.length > FOLDER_NAME_MAX_LENGTH) return { error: `폴더 이름은 ${FOLDER_NAME_MAX_LENGTH}자까지 쓸 수 있어요.` };
  const dup = getStore().folders.some(
    (f) => f.userId === CURRENT_USER_ID && f.id !== exceptId && f.name === name,
  );
  if (dup) return { error: "같은 이름의 폴더가 있어요." };
  return name;
}

/** 새 폴더 만들기. moveScrapId를 주면 만든 폴더로 그 스크랩을 바로 옮긴다. */
export async function createFolder(rawName: string, moveScrapId?: string): Promise<FolderResult> {
  const name = readFolderName(rawName);
  if (typeof name !== "string") return { ok: false, error: name.error };
  const store = getStore();
  const folder = { id: `f${Date.now()}`, userId: CURRENT_USER_ID, name, createdAt: new Date().toISOString() };
  store.folders.push(folder);
  if (moveScrapId) {
    const scrap = store.scraps.find((s) => s.id === moveScrapId && s.userId === CURRENT_USER_ID);
    if (scrap) scrap.folderId = folder.id;
  }
  refresh();
  return { ok: true, folderId: folder.id };
}

export async function renameFolder(folderId: string, rawName: string): Promise<FolderResult> {
  const folder = getStore().folders.find((f) => f.id === folderId && f.userId === CURRENT_USER_ID);
  if (!folder) return { ok: false, error: "폴더를 찾을 수 없어요." };
  const name = readFolderName(rawName, folderId);
  if (typeof name !== "string") return { ok: false, error: name.error };
  folder.name = name;
  refresh();
  return { ok: true, folderId };
}

/** 폴더 삭제. 담긴 스크랩은 지우지 않고 '모든 스크랩'에 그대로 남긴다. */
export async function deleteFolder(folderId: string): Promise<ActionResult> {
  const store = getStore();
  const idx = store.folders.findIndex((f) => f.id === folderId && f.userId === CURRENT_USER_ID);
  if (idx === -1) return { ok: false, error: "폴더를 찾을 수 없어요." };
  store.folders.splice(idx, 1);
  for (const s of store.scraps) if (s.userId === CURRENT_USER_ID && s.folderId === folderId) s.folderId = undefined;
  refresh();
  return { ok: true };
}

/** 스크랩을 다른 폴더로 옮기기. folderId가 없으면 폴더에서 빼서 '모든 스크랩'에만 둔다. */
export async function moveScrapToFolder(scrapId: string, folderId?: string): Promise<ActionResult> {
  const store = getStore();
  const scrap = store.scraps.find((s) => s.id === scrapId && s.userId === CURRENT_USER_ID);
  if (!scrap) return { ok: false, error: "스크랩을 찾을 수 없어요." };
  if (folderId && !store.folders.some((f) => f.id === folderId && f.userId === CURRENT_USER_ID)) {
    return { ok: false, error: "폴더를 찾을 수 없어요." };
  }
  scrap.folderId = folderId || undefined;
  refresh();
  return { ok: true };
}
