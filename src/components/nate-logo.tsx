import Image from "next/image";

// 네이트 로고 (빨간 정사각형 "n" 아이콘, public/images/nate-logo.svg)
export function NateLogo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/nate-logo.svg"
      alt="nate"
      width={size}
      height={size}
      unoptimized
      priority
      className={`shrink-0 ${className ?? ""}`}
    />
  );
}
