import { ImageResponse } from "next/og";

// 아이폰 홈 화면 아이콘 (PNG만 지원해서 코드로 생성). iOS가 모서리를 알아서 둥글게 깎으므로 꽉 찬 정사각형으로 그린다.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// public/images/nate-logo.svg 의 흰색 "n" 모양 (24×24 기준)
const N_PATH =
  "M13.655 6.00029H6.28796C6.12815 6.00029 5.99872 6.12973 5.99872 6.28881V17.7154C5.99872 17.873 6.12671 18.0003 6.28362 18.0003H9.22596C9.38359 18.0003 9.51086 17.873 9.51086 17.7154V9.55365H12.7649C13.984 9.55365 14.9718 10.5414 14.9718 11.7599V17.7154C14.9718 17.873 15.0991 18.0003 15.2567 18.0003H18.2807C18.4376 18.0003 18.5656 17.873 18.5656 17.7154V10.9109C18.5656 8.19854 16.3667 6.00029 13.655 6.00029Z";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ff2c2e",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 24 24">
          <path d={N_PATH} fill="#ffffff" fillRule="evenodd" />
        </svg>
      </div>
    ),
    size,
  );
}
