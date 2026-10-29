import "server-only";
import { createSeed, type SeedData } from "@/lib/mock/seed";

// 인메모리 저장소 (PoC). 실제 DB/API로 바꿀 때는 이 파일과 data.ts만 교체한다.
// 개발 서버의 HMR에도 데이터가 유지되도록 globalThis에 둔다.

/** 목업 데이터(seed.ts)를 바꿨을 때 올리면, 실행 중인 서버도 새 목업으로 다시 채운다. */
const SEED_VERSION = 11;

const g = globalThis as typeof globalThis & {
  __scrapStore?: { version: number; data: SeedData };
};

export function getStore(): SeedData {
  if (g.__scrapStore?.version !== SEED_VERSION) {
    g.__scrapStore = { version: SEED_VERSION, data: createSeed() };
  }
  return g.__scrapStore.data;
}
