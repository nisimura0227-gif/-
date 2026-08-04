"use client";

import { useEffect, useState } from "react";

type Item = { id: string; name: string; price?: number };

export default function ManageList({
  apiBase,
  title,
  itemLabel,
  addPlaceholder,
  withPrice,
}: {
  apiBase: string;
  title: string;
  itemLabel: string;
  addPlaceholder: string;
  withPrice?: boolean;
}) {
  const [items, setItems] = useState<Item[] | null>(null);
  const [newValue, setNewValue] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingPrice, setEditingPrice] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function load() {
    fetch(apiBase)
      .then((r) => r.json())
      .then((data) => setItems(data.names || data.items || []));
  }

  useEffect(load, [apiBase]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newValue.trim() || busy) return;
    if (withPrice && newPrice.trim() === "") return;
    setBusy(true);
    setError("");
    const body: Record<string, unknown> = { name: newValue.trim() };
    if (withPrice) body.price = Number(newPrice);
    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "追加に失敗しました。");
    } else {
      setNewValue("");
      setNewPrice("");
      load();
    }
    setBusy(false);
  }

  async function handleSaveEdit(id: string) {
    if (!editingValue.trim() || busy) return;
    if (withPrice && editingPrice.trim() === "") return;
    setBusy(true);
    setError("");
    const body: Record<string, unknown> = { name: editingValue.trim() };
    if (withPrice) body.price = Number(editingPrice);
    const res = await fetch(`${apiBase}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "更新に失敗しました。");
    } else {
      setEditingId(null);
      load();
    }
    setBusy(false);
  }

  async function handleDelete(id: string) {
    if (busy) return;
    if (!confirm("削除してもよろしいですか？")) return;
    setBusy(true);
    await fetch(`${apiBase}/${id}`, { method: "DELETE" });
    load();
    setBusy(false);
  }

  return (
    <div>
      <h2 className="mb-4 text-base font-bold text-brand-dark">{title}</h2>

      <form onSubmit={handleAdd} className="mb-5 flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={addPlaceholder}
            className="flex-1 rounded-xl border-2 border-gray-300 bg-white px-3 py-3 text-base focus:border-brand focus:outline-none"
          />
          {withPrice && (
            <input
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="金額"
              inputMode="numeric"
              className="w-24 rounded-xl border-2 border-gray-300 bg-white px-3 py-3 text-base focus:border-brand focus:outline-none"
            />
          )}
        </div>
        <button
          type="submit"
          disabled={busy || !newValue.trim() || (withPrice && newPrice.trim() === "")}
          className="rounded-xl bg-brand px-4 py-3 text-base font-bold text-white active:bg-brand-dark disabled:bg-gray-300"
        >
          追加
        </button>
      </form>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

      {items === null ? (
        <p className="py-8 text-center text-sm text-gray-400">読み込み中...</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
          {itemLabel}が登録されていません。
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 px-3 py-2.5">
              {editingId === item.id ? (
                <>
                  <input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    autoFocus
                    className="flex-1 rounded-lg border-2 border-brand px-2 py-2 text-base focus:outline-none"
                  />
                  {withPrice && (
                    <input
                      value={editingPrice}
                      onChange={(e) => setEditingPrice(e.target.value.replace(/[^0-9]/g, ""))}
                      inputMode="numeric"
                      className="w-20 rounded-lg border-2 border-brand px-2 py-2 text-base focus:outline-none"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleSaveEdit(item.id)}
                    className="rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white active:bg-brand-dark"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500"
                  >
                    取消
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-base text-gray-800">
                    {item.name}
                    {withPrice && typeof item.price === "number" ? (
                      <span className="ml-2 text-sm text-gray-500">￥{item.price.toLocaleString()}</span>
                    ) : null}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingValue(item.name);
                      setEditingPrice(typeof item.price === "number" ? String(item.price) : "");
                    }}
                    className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600"
                  >
                    編集
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500"
                  >
                    削除
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
