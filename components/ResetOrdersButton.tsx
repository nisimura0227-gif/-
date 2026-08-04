"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetOrdersButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleReset() {
    if (busy) return;
    if (!confirm("今週の注文データを全てリセットします。よろしいですか？（名前の登録は消えません）")) return;
    setBusy(true);
    await fetch("/api/orders/reset", { method: "POST" });
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      disabled={busy}
      className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-600 active:bg-red-100 disabled:opacity-50"
    >
      {busy ? "リセット中..." : "🗑 今週の注文をリセット"}
    </button>
  );
}
