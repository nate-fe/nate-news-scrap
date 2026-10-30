import Link from "next/link";
import { NateLogo } from "@/components/nate-logo";

// MD3 Small top app bar
// - variant="scrap": 스크랩 서비스 화면 → "nate 뉴스 스크랩" + 오른쪽 '스크랩 하는 법(임시)'
// - variant="news": 네이트 뉴스 기사 화면(목업) → "nate 뉴스"
export function SiteHeader({ variant }: { variant: "scrap" | "news" }) {
  return (
    <header className="sticky top-0 z-10 border-b border-divider bg-surface">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-on-surface"
          aria-label={variant === "scrap" ? "네이트 뉴스 스크랩 홈" : "네이트 뉴스"}
        >
          <NateLogo />
          <span className="text-xl leading-none font-extrabold">
            뉴스{variant === "scrap" && <span className="text-primary"> 스크랩</span>}
          </span>
        </Link>
        {variant === "scrap" && (
          <Link href="/guide/scrap" className="md-btn md-btn-outlined h-9 px-3 text-[14px] sm:px-4 sm:text-sm">
            스크랩 하는 법(임시)
          </Link>
        )}
      </div>
    </header>
  );
}
