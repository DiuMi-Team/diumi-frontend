import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_KR } from "next/font/google";
import { TouchActiveSupport } from "@/components/common/TouchActiveSupport";
import "./globals.css";

const ibmPlexSansKr = IBM_Plex_Sans_KR({
  variable: "--font-ibm-plex-sans-kr",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "디우미",
  description: "키오스크 주문을 연습하고 직접 해 보는 시니어 디지털 생활 도우미",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#DFEBEC",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${ibmPlexSansKr.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-1 font-sans text-16 text-text">
        <div
          data-testid="app-shell"
          className="mx-auto flex h-dvh w-full max-w-[480px] flex-col bg-white"
        >
          {children}
        </div>
        <TouchActiveSupport />
      </body>
    </html>
  );
}
