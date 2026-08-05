"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PAYMENT_OPTIONS } from "@/lib/storeTypes";
import { loadSavedName, saveName } from "@/lib/savedName";
import { useCountdown } from "./useCountdown";
import Button from "./ui/Button";
import { Card, CardSection } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Input, Select, FieldLabel, HelpText } from "./ui/Field";

type NameLite = { id: string; name: string };
type MenuLite = { id: string; name: string; price: number };

/** 現在の自分の注文内容 */
type MyOrder = {
  menuItem: string;
  isLarge: boolean;
  paymentMethod: string;
  isPaid: boolean;
  total: number;
};

const COLOR_DOT: Record<string, string> = {
  赤: "#ef4444",
  青: "#3b82f6",
  黄: "#eab308",
  緑: "#22c55e",
};

function paymentColorDot(opt: string): string | null {
  for (const key of Object.keys(COLOR_DOT)) {
    if (opt.startsWith(key)) return COLOR_DOT[key];
  }
  return null;
}

function yen(n: number): string {
  return `¥${n.toLocaleString()}`;
}

export default function OrderForm({
  orderedVia,
  names,
  menuItems,
  fixedPayment,
  largeExtraPrice,
  cutoffAtMs,
  serverNowMs,
}: {
  orderedVia: "today" | "tomorrow";
  names: NameLite[];
  menuItems: MenuLite[];
  fixedPayment?: string;
  largeExtraPrice: number;
  cutoffAtMs: number;
  serverNowMs: number;
}) {
  const router = useRouter();

  // 今日の注文のみ締切の対象
  const { closed: pastCutoff } = useCountdown(cutoffAtMs, serverNowMs);
  const closed = orderedVia === "today" && pastCutoff;

  const [phase, setPhase] = useState<"loading" | "form" | "done">("loading");
  const [myOrder, setMyOrder] = useState<MyOrder | null>(null);

  const [name, setName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [menuItem, setMenuItem] = useState("");
  const [isLarge, setIsLarge] = useState(false);
  const [payment, setPayment] = useState(fixedPayment ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /** 保存済みの名前で、すでに注文が入っていないか確認する */
  const checkExistingOrder = useCallback(
    async (targetName: string) => {
      try {
        const res = await fetch(
          `/api/orders/mine?name=${encodeURIComponent(targetName)}&via=${orderedVia}`,
          { cache: "no-store" }
        );
        if (!res.ok) return null;
        const data = await res.json();
        return (data.order as MyOrder | null) ?? null;
      } catch {
        return null;
      }
    },
    [orderedVia]
  );

  // 画面を開いたとき：保存済みの名前を読み込み、注文済みなら完了画面を出す
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = loadSavedName();
      if (!saved) {
        if (!cancelled) {
          setEditingName(true);
          setPhase("form");
        }
        return;
      }
      const existing = await checkExistingOrder(saved);
      if (cancelled) return;
      setName(saved);
      if (existing) {
        setMyOrder(existing);
        setMenuItem(existing.menuItem);
        setIsLarge(existing.isLarge);
        setPayment(fixedPayment ?? existing.paymentMethod);
        setPhase("done");
      } else {
        setPhase("form");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [checkExistingOrder, fixedPayment]);

  const selectedMenu = menuItems.find((m) => m.name === menuItem) ?? null;
  const estimatedTotal = selectedMenu ? selectedMenu.price + (isLarge ? largeExtraPrice : 0) : 0;
  const canSubmit = Boolean(name.trim()) && Boolean(menuItem) && Boolean(payment) && !submitting && !closed;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderedVia,
          name: name.trim(),
          menuItem,
          isLarge,
          paymentMethod: payment,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "注文に失敗しました。もう一度お試しください。");
        setSubmitting(false);
        return;
      }
      saveName(name);
      const o = data.order;
      setMyOrder({
        menuItem: o.menuItem,
        isLarge: o.isLarge,
        paymentMethod: o.paymentMethod,
        isPaid: o.isPaid === true,
        total: (o.unitPrice ?? 0) + (o.largeExtra ?? 0),
      });
      setEditingName(false);
      setPhase("done");
      setSubmitting(false);
    } catch {
      setError("通信エラーが発生しました。電波状況を確認してもう一度お試しください。");
      setSubmitting(false);
    }
  }

  if (phase === "loading") {
    return <p className="py-16 text-center text-sm text-gray-400">読み込み中...</p>;
  }

  /* ---------------- 注文済みの表示 ---------------- */
  if (phase === "done" && myOrder) {
    return (
      <div className="flex flex-col gap-5 py-4">
        <Card className="border-2 border-brand bg-brand-light px-4 py-6 text-center">
          <p className="text-3xl">✅</p>
          <p className="mt-2 text-lg font-bold text-brand-dark">
            {orderedVia === "today" ? "本日の注文は完了しています" : "明日の注文は完了しています"}
          </p>
        </Card>

        <Card className="divide-y divide-gray-100 p-0 text-base">
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-gray-500">名前</span>
            <span className="font-bold text-gray-800">{name}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-gray-500">お弁当</span>
            <span className="font-bold text-gray-800">{myOrder.menuItem}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-gray-500">大盛り</span>
            <span className="font-bold text-gray-800">{myOrder.isLarge ? "あり" : "なし"}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-gray-500">支払い方法</span>
            <span className="text-right font-bold text-gray-800">{myOrder.paymentMethod}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-gray-500">金額</span>
            <span className="font-bold text-gray-800">{yen(myOrder.total)}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span className="text-gray-500">支払い状況</span>
            {myOrder.isPaid ? (
              <Badge variant="success">✅ 支払い済み</Badge>
            ) : (
              <Badge variant="warning">⏳ 確認中</Badge>
            )}
          </div>
        </Card>

        {closed ? (
          <p className="rounded-xl bg-gray-50 px-4 py-3 text-center text-sm text-gray-500">
            受付時間を過ぎたため、変更できません。
          </p>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => {
              setPhase("form");
              setError("");
            }}
          >
            ✏️ 注文内容を変更する
          </Button>
        )}

        <Button type="button" variant="primary" size="lg" onClick={() => router.push("/")}>
          トップへ戻る
        </Button>
      </div>
    );
  }

  /* ---------------- 受付終了 ---------------- */
  if (closed) {
    return (
      <div className="flex flex-col items-center gap-4 py-14 text-center">
        <p className="text-4xl">🔴</p>
        <p className="text-xl font-bold text-gray-700">本日の受付は終了しました</p>
        <Button type="button" variant="muted" size="lg" className="mt-4 w-full" onClick={() => router.push("/")}>
          トップへ戻る
        </Button>
      </div>
    );
  }

  /* ---------------- 注文フォーム ---------------- */
  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {orderedVia === "today" && (
        <Card className="border-2 border-amber-200 bg-amber-50 text-sm leading-relaxed text-amber-800">
          <p>⏰ 受付は締切時刻までです。</p>
          <p>💴「手渡し」を選んだ方は、締切までに担当者へお支払いください。</p>
        </Card>
      )}

      <div>
        <FieldLabel>名前</FieldLabel>
        {name && !editingName ? (
          <div className="flex items-center justify-between rounded-xl border-2 border-gray-300 bg-gray-50 px-4 py-4">
            <span className="text-lg font-bold text-gray-800">{name}</span>
            <Button type="button" variant="muted" size="sm" onClick={() => setEditingName(true)}>
              変更
            </Button>
          </div>
        ) : (
          <>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              list="names-list"
              placeholder="名前を選ぶか、新しく入力してください"
              maxLength={20}
              required
              className="text-lg"
            />
            <datalist id="names-list">
              {names.map((n) => (
                <option key={n.id} value={n.name} />
              ))}
            </datalist>
            <HelpText>入力した名前はこの端末に保存され、次回から自動で入ります。</HelpText>
          </>
        )}
      </div>

      <div>
        <FieldLabel>{orderedVia === "today" ? "今日のメニュー" : "明日のメニュー"}</FieldLabel>
        <Select value={menuItem} onChange={(e) => setMenuItem(e.target.value)} required className="text-lg">
          <option value="">選択してください</option>
          {menuItems.map((m) => (
            <option key={m.id} value={m.name}>
              {m.name}（{yen(m.price ?? 0)}）
            </option>
          ))}
        </Select>

        <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border-2 border-gray-300 px-4 py-3.5 text-base">
          <input
            type="checkbox"
            checked={isLarge}
            onChange={(e) => setIsLarge(e.target.checked)}
            className="h-5 w-5 accent-brand"
          />
          大盛りにする（+{yen(largeExtraPrice)}）
        </label>

        {selectedMenu && (
          <p className="mt-3 rounded-xl bg-brand-light px-4 py-3 text-right text-base font-bold text-brand-dark">
            合計 {yen(estimatedTotal)}
          </p>
        )}
      </div>

      <div>
        <FieldLabel>支払い方法</FieldLabel>
        {fixedPayment ? (
          <div className="rounded-xl border-2 border-brand bg-brand-light px-4 py-4 text-lg font-semibold text-brand-dark">
            {fixedPayment}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {PAYMENT_OPTIONS.map((opt) => {
              const dot = paymentColorDot(opt);
              return (
                <label
                  key={opt}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-4 text-lg transition-colors ${
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
                  {dot && (
                    <span
                      className="inline-block h-4 w-4 flex-shrink-0 rounded-full border border-black/10"
                      style={{ backgroundColor: dot }}
                    />
                  )}
                  {opt}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

      <Button type="submit" variant="accent" size="lg" disabled={!canSubmit} className="mt-2">
        {submitting ? "送信中..." : myOrder ? "この内容に変更する" : "注文する"}
      </Button>

      {myOrder && (
        <Button type="button" variant="muted" onClick={() => setPhase("done")}>
          変更をやめる
        </Button>
      )}
    </form>
  );
}
