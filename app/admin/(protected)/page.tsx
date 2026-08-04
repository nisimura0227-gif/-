import { listOrdersByDate, listOrderDates } from "@/lib/store";
import { todayStr, tomorrowStr, formatDateJp, isWithinLastDays } from "@/lib/date";
import OrderListSection from "@/components/OrderListSection";
import RefreshButton from "@/components/RefreshButton";
import AdminNameEditor from "@/components/AdminNameEditor";
import ResetOrdersButton from "@/components/ResetOrdersButton";

export const dynamic = "force-dynamic";

async function getWeeklyRanking() {
  const dates = await listOrderDates();
  const recentDates = dates.filter((d) => isWithinLastDays(d, 7));
  const ordersByDate = await Promise.all(recentDates.map((d) => listOrdersByDate(d)));
  const counts = new Map<string, number>();
  for (const orders of ordersByDate) {
    for (const o of orders) {
      // 大盛りは通常メニューと同じ項目として集計する（大盛りだけを別順位にはしない）
      counts.set(o.menuItem, (counts.get(o.menuItem) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .map(([menuItem, count]) => ({ menuItem, count }))
    .sort((a, b) => b.count - a.count);
}

export default async function AdminDashboardPage() {
  const today = todayStr();
  const tomorrow = tomorrowStr();
  const [todayOrders, tomorrowOrders, ranking] = await Promise.all([
    listOrdersByDate(today),
    listOrdersByDate(tomorrow),
    getWeeklyRanking(),
  ]);

  return (
    <div>
      <AdminNameEditor />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">最新の注文状況</p>
        <div className="flex items-center gap-2">
          <RefreshButton />
        </div>
      </div>
      <OrderListSection
        title="📋 今日の注文一覧"
        dateLabel={formatDateJp(today)}
        orders={todayOrders}
        showPayment
      />
      <OrderListSection
        title="📅 明日の注文一覧"
        dateLabel={formatDateJp(tomorrow)}
        orders={tomorrowOrders}
        showPayment={false}
      />

      <section className="mb-8">
        <h2 className="mb-1 text-base font-bold text-brand-dark">🏆 直近7日間の人気メニュー</h2>
        <p className="mb-3 text-xs text-gray-500">大盛りも通常と同じメニューとして集計しています</p>
        {ranking.length === 0 ? (
          <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
            この期間の注文はまだありません。
          </p>
        ) : (
          <ol className="divide-y divide-gray-100 rounded-xl border border-gray-100">
            {ranking.map((r, i) => (
              <li key={r.menuItem} className="flex items-center justify-between px-3 py-2.5 text-sm">
                <span className="font-bold text-gray-800">
                  {i + 1}位　{r.menuItem}
                </span>
                <span className="text-gray-500">{r.count}個</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-brand-dark">🔄 今週のリセット</h2>
        <p className="mb-3 text-xs text-gray-500">
          金曜日など好きなタイミングで押してください。注文データが消えます（名前の登録は消えません）。
        </p>
        <ResetOrdersButton />
      </section>
    </div>
  );
}
