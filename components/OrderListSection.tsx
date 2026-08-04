import type { Order } from "@/lib/store";
import { formatTimeHm } from "@/lib/date";

function aggregate(orders: Order[]) {
  const counts = new Map<string, number>();
  for (const o of orders) {
    counts.set(o.menuItem, (counts.get(o.menuItem) ?? 0) + 1);
  }
  const rows = Array.from(counts.entries()).map(([menuItem, count]) => ({ menuItem, count }));
  const total = orders.length;
  return { rows, total };
}

export default function OrderListSection({
  title,
  dateLabel,
  orders,
  showPayment,
}: {
  title: string;
  dateLabel: string;
  orders: Order[];
  showPayment: boolean;
}) {
  const { rows, total } = aggregate(orders);

  return (
    <section className="mb-8">
      <h2 className="mb-1 text-base font-bold text-brand-dark">{title}</h2>
      <p className="mb-3 text-xs text-gray-500">{dateLabel}</p>

      {orders.length === 0 ? (
        <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">まだ注文はありません。</p>
      ) : (
        <>
          <ul className="mb-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                <div>
                  <p className="font-bold text-gray-800">{o.name}</p>
                  <p className="text-gray-500">
                    {o.menuItem}
                    {showPayment ? ` ・ ${o.paymentMethod}` : ""}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{formatTimeHm(new Date(o.orderedAt))}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-xl bg-brand-light px-4 py-3">
            <p className="mb-1 text-xs font-bold text-brand-dark">自動集計</p>
            <ul className="text-sm text-gray-700">
              {rows.map((r) => (
                <li key={r.menuItem} className="flex justify-between">
                  <span>{r.menuItem}</span>
                  <span>{r.count}個</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 border-t border-brand/30 pt-2 text-right text-sm font-bold text-brand-dark">
              合計 {total}個
            </p>
          </div>
        </>
      )}
    </section>
  );
}
