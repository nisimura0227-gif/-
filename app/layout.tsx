import type { Metadata, Viewport } from "next";
import "./globals.css";

const APP_NAME = "現場めし";

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: "建設現場のお弁当注文サイト",
  applicationName: APP_NAME,
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: {
    // iPhoneで「ホーム画面に追加」したときの表示名
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    // 数字が勝手に電話番号リンクにならないようにする
    telephone: false,
  },
  openGraph: {
    title: APP_NAME,
    description: "建設現場のお弁当注文サイト",
    siteName: APP_NAME,
    type: "website",
  },
  // 検索エンジンには載せない（公式LINEからのみ使う想定のため）
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2f7d4f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-white">
        <div className="mx-auto min-h-screen w-full max-w-md bg-white shadow-sm">{children}</div>
      </body>
    </html>
  );
}
