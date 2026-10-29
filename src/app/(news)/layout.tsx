import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";

// 브라우저 탭 제목도 스크랩 서비스와 헷갈리지 않게 "네이트 뉴스"로
export const metadata: Metadata = {
  title: { absolute: "네이트 뉴스", template: "%s | 네이트 뉴스" },
};

// 네이트 뉴스 기사 화면 목업. 실제 서비스에서는 기존 기사 페이지에 스크랩 버튼만 붙는다.
export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader variant="news" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-5 sm:px-4 sm:py-6">{children}</main>
    </>
  );
}
