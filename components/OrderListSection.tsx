"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Order } from "@/lib/storeTypes";
import { orderTotal } from "@/lib/storeTypes";
import { formatTimeHm } from "@/lib/date";

function yen(n: number): string {
  return `¥${n.toLocaleString()}`;
}

/**
 * 管理画面の注文一覧。
 * 支払い済みチェックは管理者のみが操作でき、押した時点で保存される。
 */
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
  const router = useRouter();
  // 保存の往復を待たずに画面へ反映するための一時的な状態
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const isPaidOf = (o: Order) => pending[o.id] ?? o.isPaid;

  async function togglePaid(order: Order) {
    const next = !isPaidOf(order);
    setPending((p) => ({ ...p, [order.id]: next }));
    setBusyId(order.id);
    setError("");
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPaid: next }),
      });
      if (!res.ok) throw new Error("failed");
      router.refresh();
    } catch {
      // 失敗したら元の状態へ戻す
      setPending((p) => ({ ...p, [order.id]: !next }));
      setError("支払い状況の更新に失敗しました。通信環境を確認してください。");
    } finally {
      setBusyId(null);
    }
  }

  const counts = new Map<string, number>();
  for (const o of orders) counts.set(o.menuItem, (counts.get(o.menuItem) ?? 0) + 1);
  const totalAmount = orders.reduce((sum, o) => sum + orderTotal(o), 0);
  const unpaidCount = orders.filter((o) => !isPaidOf(o)).length;

  return (
    <section className="mb-8">
      <h2 className="mb-1 text-base font-bold text-brand-dark">{title}</h2>
      <p className="mb-3 text-xs text-gray-500">{dateLabel}</p>

      {error && <p className="mb-3 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

      {orders.length === 0 ? (
        <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">まだ注文はありません。</p>
      ) : (
        <>
          <ul className="mb-4 divide-y divide-gray-100 rounded-xl border border-gray-100">
            {orders.map((o) => {
              const paid = isPaidOf(o);
              return (
                <li key={o.id} className="px-3 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800">{o.name}</p>
                      <p className="text-sm text-gray-500">
                        {o.menuItem}
                        {o.isLarge ? "（大盛り）" : ""}
                      </p>
                      {showPayment && <p className="text-sm text-gray-500">{o.paymentMethod}</p>}
                    </div>
                    <div className="flex flex-shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-bold text-gray-700">{yen(orderTotal(o))}</span>
                      <span className="text-xs text-gray-400">{formatTimeHm(new Date(o.orderedAt))}</span>
                    </div>
                  </div>

                  <label
                    className={`mt-2 flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      paid ? "border-brand bg-brand-light font-bold text-brand-dark" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={paid}
                      disabled={busyId === o.id}
                      onChange={() => togglePaid(o)}
                      className="h-5 w-5 accent-brand"
                    />
                    {paid ? "✅ 支払い済み" : "⏳ 未確認"}
                  </label>
                </li>
              );
            })}
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
            <div className="mt-2 border-t border-brand/30 pt-2 text-sm font-bold text-brand-dark">
              <p className="flex justify-between">
                <span>合計</span>
                <span>
                  {orders.length}個 / {yen(totalAmount)}
                </span>
              </p>
              <p className="mt-1 flex justify-between text-xs font-semibold text-amber-700">
                <span>支払い未確認</span>
                <span>{unpaidCount}人</span>
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
