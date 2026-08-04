import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "現場のお弁当注文",
  description: "建設現場向け お弁当注文サイト",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-white">
        <div className="mx-auto min-h-screen w-full max-w-md bg-white shadow-sm">
          {children}
        </div>
      </body>
    </html>
  );
}
