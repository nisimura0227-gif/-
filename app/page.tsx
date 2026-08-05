import Link from "next/link";
import { getImageInfo, getSettings, listOrderDates, listOrdersByDate } from "@/lib/store";
import { todayStr, formatDateJp, formatCutoffLabel, cutoffEpochMs, isWithinLastDays } from "@/lib/date";
import ImageZoomModal from "@/components/ImageZoomModal";
import StatusCard from "@/components/StatusCard";
import OrderButtons from "@/components/OrderButtons";

export const dynamic = "force-dynamic";

/** 直近7日間の人気メニュー。大盛りは通常と同じメニューとしてまとめて数える。 */
async function getWeeklyRanking() {
  const dates = await listOrderDates();
  const recent = dates.filter((d) => isWithinLastDays(d, 7));
  const ordersByDate = await Promise.all(recent.map((d) => listOrdersByDate(d)));
  const counts = new Map<string, number>();
  for (const orders of ordersByDate) {
    for (const o of orders) {
      counts.set(o.menuItem, (counts.get(o.menuItem) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([menuItem, count]) => ({ menuItem, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

const RANK_ICONS = ["🥇", "🥈", "🥉"];

export default async function TopPage() {
  const [image, settings, ranking] = await Promise.all([getImageInfo(), getSettings(), getWeeklyRanking()]);

  const now = new Date();
  const serverNowMs = now.getTime();
  const cutoffAtMs = cutoffEpochMs(settings.cutoffHour, settings.cutoffMinute, now);
  const cutoffLabel = formatCutoffLabel(settings.cutoffHour, settings.cutoffMinute);

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-4 py-3">
        <h1 className="text-lg font-bold text-brand-dark">🍱 現場めし</h1>
        <Link
          href="/admin/login"
          className="rounded-full border border-gray-300 px-3 py-1.5 text-xs text-gray-600 active:bg-gray-100"
        >
          管理者ログイン
        </Link>
      </header>

      <div className="flex-1 px-4 pb-10">
        <StatusCard
          dateLabel={formatDateJp(todayStr(now))}
          adminName={settings.adminName}
          cutoffLabel={cutoffLabel}
          cutoffAtMs={cutoffAtMs}
          serverNowMs={serverNowMs}
        />

        <section className="mt-5">
          <p className="mb-2 text-sm font-semibold text-gray-600">今週のメニュー（タップで拡大）</p>
          {image?.updatedAt ? (
            <ImageZoomModal
              src={`/api/image/file?v=${encodeURIComponent(image.updatedAt)}`}
              alt="今週のメニュー"
            />
          ) : (
            <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center text-sm text-gray-400">
              今週のメニュー画像は
              <br />
              まだ登録されていません
            </div>
          )}
        </section>

        <section className="mt-6">
          <OrderButtons cutoffAtMs={cutoffAtMs} serverNowMs={serverNowMs} />
        </section>

        {ranking.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-1 text-base font-bold text-brand-dark">🏆 最近よく頼まれているお弁当</h2>
            <p className="mb-3 text-xs text-gray-500">直近7日間・大盛りも同じメニューとして集計</p>
            <ol className="divide-y divide-gray-100 rounded-2xl border border-gray-100">
              {ranking.map((r, i) => (
                <li key={r.menuItem} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="font-bold text-gray-800">
                    {RANK_ICONS[i] ?? `${i + 1}位`} {r.menuItem}
                  </span>
                  <span className="text-gray-500">{r.count}個</span>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </main>
  );
}
