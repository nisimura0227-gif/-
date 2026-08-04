"use client";

import { useEffect, useState } from "react";

export default function AdminNameEditor() {
  const [name, setName] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/name")
      .then((r) => r.json())
      .then((data) => setName(data.name || ""));
  }, []);

  async function handleSave() {
    if (!value.trim() || busy) return;
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/name", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: value.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "更新に失敗しました。");
    } else {
      setName(data.name);
      setEditing(false);
    }
    setBusy(false);
  }

  if (name === null) {
    return <p className="text-sm text-gray-400">読み込み中...</p>;
  }

  return (
    <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="mb-2 text-xs font-bold text-gray-500">現在の担当者名（一般利用者にも表示されます）</p>
      {editing ? (
        <div className="flex gap-2">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            className="flex-1 rounded-lg border-2 border-brand px-3 py-2 text-base focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || !value.trim()}
            className="rounded-lg bg-brand px-3 py-2 text-sm font-bold text-white active:bg-brand-dark disabled:bg-gray-300"
          >
            保存
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg bg-gray-200 px-3 py-2 text-sm text-gray-600"
          >
            取消
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-gray-800">{name}</p>
          <button
            type="button"
            onClick={() => {
              setValue(name);
              setEditing(true);
            }}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600"
          >
            変更する
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm font-semibold text-red-600">{error}</p>}
    </div>
  );
}
