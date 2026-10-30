import type { Metadata } from "next";
import { DialogProvider } from "@/components/dialog-provider";
import "./globals.css";

// 폰트: 맑은 고딕 (Windows 기본 폰트라 따로 내려받지 않는다. 지정은 globals.css의 --font-sans)

export const metadata: Metadata = {
  title: {
    default: "네이트 뉴스 스크랩",
    template: "%s | 네이트 뉴스 스크랩",
  },
  description: "기사를 스크랩하고 메모를 남기는 개인 기록 서비스 (PoC)",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background font-sans text-base text-on-surface">
        {/* 헤더와 본문은 (scrap), (news) 그룹 레이아웃에서 각각 그린다 */}
        {/* 앱 공통 알림·확인 창 (브라우저 기본 alert/confirm 대신) */}
        <DialogProvider>{children}</DialogProvider>
      </body>
    </html>
  );
}
