"use client";

import { useEffect, useState } from "react";
import { formatDateJp, formatTimeHm } from "@/lib/date";

type Order = {
  id: string;
  deliveryDate: string;
  name: string;
  menuItem: string;
  isLarge: boolean;
  paymentMethod: string;
  orderedAt: string;
};

export default function AdminHistoryPage() {
  const [dates, setDates] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders/dates")
      .then((r) => r.json())
      .then((data) => {
        setDates(data.dates || []);
        if (data.dates?.length) setSelected(data.dates[0]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetch(`/api/orders?date=${selected}`)
      .then((r) => r.json())
      .then((data) => setOrders(data.orders || []));
  }, [selected]);

  const counts = new Map<string, number>();
  (orders ?? []).forEach((o) => counts.set(o.menuItem, (counts.get(o.menuItem) ?? 0) + 1));

  if (loading) {
    return <p className="py-10 text-center text-sm text-gray-400">読み込み中...</p>;
  }

  if (dates.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">注文履歴はまだありません。</p>;
  }

  return (
    <div>
      <h2 className="mb-3 text-base font-bold text-brand-dark">🗂 注文履歴</h2>
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="mb-4 w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base focus:border-brand focus:outline-none"
      >
        {dates.map((d) => (
          <option key={d} value={d}>
            {formatDateJp(d)}（{d}）
          </option>
        ))}
      </select>

      {orders && orders.length > 0 ? (
        <>
          <ul className="mb-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
            {orders.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-3 py-2.5 text-sm">
                <div>
                  <p className="font-bold text-gray-800">{o.name}</p>
                  <p className="text-gray-500">
                    {o.menuItem}
                    {o.isLarge ? "（大盛り）" : ""} ・ {o.paymentMethod}
                  </p>
                </div>
                <span className="text-xs text-gray-400">{formatTimeHm(new Date(o.orderedAt))}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-xl bg-brand-light px-4 py-3">
            <p className="mb-1 text-xs font-bold text-brand-dark">自動集計</p>
            <ul className="text-sm text-gray-700">
              {Array.from(counts.entries()).map(([menuItem, count]) => (
                <li key={menuItem} className="flex justify-between">
                  <span>{menuItem}</span>
                  <span>{count}個</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 border-t border-brand/30 pt-2 text-right text-sm font-bold text-brand-dark">
              合計 {orders.length}個
            </p>
          </div>
        </>
      ) : (
        <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">この日の注文はありません。</p>
      )}
    </div>
  );
}
