"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Item = { id: string; name: string };

const PAYMENT_OPTIONS = ["ケースに現金を入れました", "手渡し"];

export default function OrderForm({
  orderedVia,
  names,
  menuItems,
  fixedPayment,
}: {
  orderedVia: "today" | "tomorrow";
  names: Item[];
  menuItems: Item[];
  fixedPayment?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [menuItem, setMenuItem] = useState("");
  const [payment, setPayment] = useState(fixedPayment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const canSubmit = name && menuItem && payment && !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedVia, name, menuItem, paymentMethod: payment }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "注文に失敗しました。もう一度お試しください。");
        setSubmitting(false);
        return;
      }
      setDone(true);
    } catch {
      setError("通信エラーが発生しました。電波状況を確認してもう一度お試しください。");
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <div className="text-5xl">✅</div>
        <p className="text-xl font-bold text-brand-dark">注文しました！</p>
        <div className="w-full rounded-2xl bg-brand-light p-4 text-left text-base">
          <p>
            <span className="text-gray-500">名前：</span>
            {name}
          </p>
          <p>
            <span className="text-gray-500">メニュー：</span>
            {menuItem}
          </p>
          <p>
            <span className="text-gray-500">支払い方法：</span>
            {payment}
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full rounded-2xl bg-brand px-6 py-4 text-lg font-bold text-white active:bg-brand-dark"
        >
          トップへ戻る
        </button>
      </div>
    );
  }

  if (error === "本日の受付は終了しました。") {
    return (
      <div className="flex flex-col items-center gap-4 py-14 text-center">
        <p className="text-2xl font-bold text-gray-700">本日の受付は終了しました。</p>
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 rounded-2xl bg-gray-200 px-6 py-4 text-base font-bold text-gray-700 active:bg-gray-300"
        >
          トップへ戻る
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className="mb-2 block text-base font-bold text-gray-700">名前</label>
        <select
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-lg focus:border-brand focus:outline-none"
        >
          <option value="">選択してください</option>
          {names.map((n) => (
            <option key={n.id} value={n.name}>
              {n.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-base font-bold text-gray-700">
          {orderedVia === "today" ? "今日のメニュー" : "明日のメニュー"}
        </label>
        <select
          value={menuItem}
          onChange={(e) => setMenuItem(e.target.value)}
          required
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-lg focus:border-brand focus:outline-none"
        >
          <option value="">選択してください</option>
          {menuItems.map((m) => (
            <option key={m.id} value={m.name}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-base font-bold text-gray-700">支払い方法</label>
        {fixedPayment ? (
          <div className="rounded-xl border-2 border-brand bg-brand-light px-4 py-4 text-lg font-semibold text-brand-dark">
            {fixedPayment}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {PAYMENT_OPTIONS.map((opt) => (
              <label
                key={opt}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-4 text-lg ${
                  payment === opt ? "border-brand bg-brand-light font-bold text-brand-dark" : "border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={opt}
                  checked={payment === opt}
                  onChange={(e) => setPayment(e.target.value)}
                  className="h-5 w-5 accent-brand"
                />
                {opt}
              </label>
            ))}
          </div>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-2 w-full rounded-2xl bg-brand px-6 py-5 text-xl font-bold text-white shadow-sm active:bg-brand-dark disabled:bg-gray-300"
      >
        {submitting ? "送信中..." : "注文する"}
      </button>
    </form>
  );
}
