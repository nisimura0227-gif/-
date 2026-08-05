"use client";

import { useEffect, useState } from "react";
import Button from "./ui/Button";
import { Card } from "./ui/Card";
import { Input } from "./ui/Field";

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

      <form onSubmit={handleAdd} className="mb-5 flex flex-col gap-2.5">
        <div className="flex gap-2">
          <Input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder={addPlaceholder}
            className="flex-1"
          />
          {withPrice && (
            <Input
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="金額"
              inputMode="numeric"
              className="w-24"
            />
          )}
        </div>
        <Button type="submit" disabled={busy || !newValue.trim() || (withPrice && newPrice.trim() === "")}>
          追加
        </Button>
      </form>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

      {items === null ? (
        <p className="py-8 text-center text-sm text-gray-400">読み込み中...</p>
      ) : items.length === 0 ? (
        <Card className="border-dashed text-center text-sm text-gray-400">{itemLabel}が登録されていません。</Card>
      ) : (
        <Card className="divide-y divide-gray-100 p-0">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 px-3.5 py-3">
              {editingId === item.id ? (
                <>
                  <Input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    autoFocus
                    className="flex-1 border-brand py-2 text-base"
                  />
                  {withPrice && (
                    <Input
                      value={editingPrice}
                      onChange={(e) => setEditingPrice(e.target.value.replace(/[^0-9]/g, ""))}
                      inputMode="numeric"
                      className="w-20 border-brand py-2 text-base"
                    />
                  )}
                  <Button type="button" size="sm" onClick={() => handleSaveEdit(item.id)}>
                    保存
                  </Button>
                  <Button type="button" size="sm" variant="muted" onClick={() => setEditingId(null)}>
                    取消
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-base text-gray-800">
                    {item.name}
                    {withPrice && typeof item.price === "number" ? (
                      <span className="ml-2 text-sm text-gray-500">￥{item.price.toLocaleString()}</span>
                    ) : null}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="muted"
                    onClick={() => {
                      setEditingId(item.id);
                      setEditingValue(item.name);
                      setEditingPrice(typeof item.price === "number" ? String(item.price) : "");
                    }}
                  >
                    編集
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
                    削除
                  </Button>
                </>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
