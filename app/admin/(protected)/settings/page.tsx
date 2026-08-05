"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/lib/storeTypes";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const [adminName, setAdminName] = useState("");
  const [cutoff, setCutoff] = useState("07:55");
  const [largeExtraPrice, setLargeExtraPrice] = useState("100");
  const [shopPhone, setShopPhone] = useState("");

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const s: Settings | undefined = data.settings;
        if (s) {
          setAdminName(s.adminName);
          setCutoff(`${pad2(s.cutoffHour)}:${pad2(s.cutoffMinute)}`);
          setLargeExtraPrice(String(s.largeExtraPrice));
          setShopPhone(s.shopPhone);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    setSaved(false);

    const [h, m] = cutoff.split(":").map(Number);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminName: adminName.trim(),
          cutoffHour: h,
          cutoffMinute: m,
          largeExtraPrice: Number(largeExtraPrice || 0),
          shopPhone: shopPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "保存に失敗しました。");
      } else {
        setSaved(true);
        // 他の画面（トップページの担当者名など）にも反映させる
        router.refresh();
      }
    } catch {
      setError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="py-10 text-center text-sm text-gray-400">読み込み中...</p>;
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <h2 className="text-base font-bold text-brand-dark">⚙️ 設定</h2>

      <div>
        <label className="mb-2 block text-base font-bold text-gray-700">担当者名</label>
        <input
          value={adminName}
          onChange={(e) => setAdminName(e.target.value)}
          maxLength={20}
          required
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base focus:border-brand focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">一般ユーザーのトップページにも表示されます。</p>
      </div>

      <div>
        <label className="mb-2 block text-base font-bold text-gray-700">受付の締切時刻</label>
        <input
          type="time"
          value={cutoff}
          onChange={(e) => setCutoff(e.target.value)}
          required
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base focus:border-brand focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">この時刻を過ぎると今日の注文ができなくなります。</p>
      </div>

      <div>
        <label className="mb-2 block text-base font-bold text-gray-700">大盛りの追加料金（円）</label>
        <input
          value={largeExtraPrice}
          onChange={(e) => setLargeExtraPrice(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          required
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base focus:border-brand focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">
          変更しても、すでに入っている注文の金額はそのまま残ります。
        </p>
      </div>

      <div>
        <label className="mb-2 block text-base font-bold text-gray-700">お弁当屋の電話番号</label>
        <input
          value={shopPhone}
          onChange={(e) => setShopPhone(e.target.value)}
          inputMode="tel"
          required
          className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base focus:border-brand focus:outline-none"
        />
        <p className="mt-1 text-xs text-gray-400">管理画面の「お弁当屋へ電話する」ボタンで使われます。</p>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
      {saved && (
        <p className="rounded-lg bg-brand-light px-4 py-3 text-sm font-semibold text-brand-dark">
          設定を保存しました。
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-2xl bg-brand px-6 py-4 text-lg font-bold text-white active:bg-brand-dark disabled:bg-gray-300"
      >
        {saving ? "保存中..." : "設定を保存する"}
      </button>
    </form>
  );
}
