import Link from "next/link";
import { getImageInfo, getAdminName } from "@/lib/store";
import ImageZoomModal from "@/components/ImageZoomModal";
import BigLinkButton from "@/components/BigLinkButton";

export const dynamic = "force-dynamic";

export default async function TopPage() {
  const [image, adminName] = await Promise.all([getImageInfo(), getAdminName()]);

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold text-brand-dark">🍱 現場のお弁当注文</h1>
        <Link
          href="/admin/login"
          className="rounded-full border border-gray-300 px-3 py-1.5 text-xs text-gray-600 active:bg-gray-100"
        >
          管理者ログイン
        </Link>
      </header>

      <div className="px-4">
        <p className="mb-3 inline-block rounded-full bg-brand-light px-3 py-1.5 text-xs font-bold text-brand-dark">
          👤 現在の担当者：{adminName}
        </p>
      </div>

      <div className="flex-1 px-4 pb-8">
        <section className="mb-3">
          <p className="mb-2 text-sm font-semibold text-gray-600">今週のメニュー（タップで拡大）</p>
          {image?.updatedAt ? (
            <ImageZoomModal src={`/api/image/file?v=${encodeURIComponent(image.updatedAt)}`} alt="今週のメニュー" />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-400">
              今週のメニュー画像は
              <br />
              まだ登録されていません
            </div>
          )}
        </section>

        <section className="mt-8 flex flex-col gap-4">
          <BigLinkButton href="/order/today" variant="primary">
            🍱 今日のお弁当を注文する
          </BigLinkButton>
          <BigLinkButton href="/order/tomorrow" variant="secondary">
            📅 明日のお弁当を注文する
          </BigLinkButton>
        </section>
      </div>
    </main>
  );
}
