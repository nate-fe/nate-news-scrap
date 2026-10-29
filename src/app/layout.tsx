import type { Metadata } from "next";
import { Nanum_Gothic } from "next/font/google";
import "./globals.css";

// 한글 글리프가 많아 미리 불러오지(preload) 않고, 필요한 글자 범위만 내려받게 둔다.
const nanumGothic = Nanum_Gothic({
  weight: ["400", "700", "800"],
  variable: "--font-nanum-gothic",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "네이트 뉴스 스크랩",
    template: "%s | 네이트 뉴스 스크랩",
  },
  description: "기사를 스크랩하고 메모를 남기는 개인 기록 서비스 (PoC)",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${nanumGothic.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-on-surface">
        {/* 헤더와 본문은 (scrap), (news) 그룹 레이아웃에서 각각 그린다 */}
        {children}
      </body>
    </html>
  );
}
