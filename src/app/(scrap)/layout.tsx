import { SiteHeader } from "@/components/site-header";

// 스크랩 서비스 화면 (내 스크랩, 랭킹)
export default function ScrapLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader variant="scrap" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-5 sm:px-4 sm:py-6">{children}</main>
    </>
  );
}
