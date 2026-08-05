"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDateJp, formatTimeHm } from "@/lib/date";
import { orderTotal } from "@/lib/storeTypes";
import type { Order } from "@/lib/storeTypes";

function yen(n: number): string {
  return `¥${n.toLocaleString()}`;
}

export default function AdminHistoryPage() {
  const [dates, setDates] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadDates = useCallback(async () => {
    try {
      const res = await fetch("/api/orders/dates", { cache: "no-store" });
      const data = await res.json();
      const list: string[] = data.dates || [];
      setDates(list);
      setSelected((prev) => (prev && list.includes(prev) ? prev : list[0] ?? ""));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOrders = useCallback(async (date: string) => {
    if (!date) {
      setOrders([]);
      return;
    }
    const res = await fetch(`/api/orders?date=${encodeURIComponent(date)}`, { cache: "no-store" });
    const data = await res.json();
    setOrders(data.orders || []);
  }, []);

  useEffect(() => {
    loadDates();
  }, [loadDates]);

  useEffect(() => {
    loadOrders(selected);
  }, [selected, loadOrders]);

  async function handleDelete(order: Order) {
    if (!confirm(`${order.name} さんの注文（${order.menuItem}）を削除します。よろしいですか？`)) return;
    setBusyId(order.id);
    setError("");
    try {
      const res = await fetch(`/api/orders/${order.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
      await loadOrders(selected);
      await loadDates();
    } catch {
      setError("削除に失敗しました。通信環境を確認してもう一度お試しください。");
    } finally {
      setBusyId(null);
    }
  }

  const counts = new Map<string, number>();
  (orders ?? []).forEach((o) => counts.set(o.menuItem, (counts.get(o.menuItem) ?? 0) + 1));
  const totalAmount = (orders ?? []).reduce((sum, o) => sum + orderTotal(o), 0);

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

      {error && <p className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

      {orders && orders.length > 0 ? (
        <>
          <ul className="mb-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
            {orders.map((o) => (
              <li key={o.id} className="flex items-start justify-between gap-2 px-3 py-3">
                <div className="min-w-0">
                  <p className="font-bold text-gray-800">
                    {o.name}
                    {o.isPaid && <span className="ml-2 text-xs font-normal text-brand-dark">✅ 支払い済み</span>}
                  </p>
                  <p className="text-sm text-gray-500">
                    {o.menuItem}
                    {o.isLarge ? "（大盛り）" : ""} ・ {o.paymentMethod}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTimeHm(new Date(o.orderedAt))} ・ {yen(orderTotal(o))}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(o)}
                  disabled={busyId === o.id}
                  className="flex-shrink-0 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-500 active:bg-red-100 disabled:opacity-50"
                >
                  {busyId === o.id ? "削除中" : "削除"}
                </button>
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
            <p className="mt-2 flex justify-between border-t border-brand/30 pt-2 text-sm font-bold text-brand-dark">
              <span>合計</span>
              <span>
                {orders.length}個 / {yen(totalAmount)}
              </span>
            </p>
          </div>
        </>
      ) : (
        <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">この日の注文はありません。</p>
      )}
    </div>
  );
}
