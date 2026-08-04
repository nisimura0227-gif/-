"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "ログインに失敗しました。");
        setSubmitting(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center px-6 py-10">
      <h1 className="mb-8 text-center text-xl font-bold text-brand-dark">🔒 管理者ログイン</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="mb-2 block text-base font-bold text-gray-700">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
            className="w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-4 text-lg focus:border-brand focus:outline-none"
          />
        </div>
        {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !password}
          className="w-full rounded-2xl bg-brand px-6 py-5 text-xl font-bold text-white shadow-sm active:bg-brand-dark disabled:bg-gray-300"
        >
          {submitting ? "確認中..." : "ログイン"}
        </button>
      </form>
      <Link href="/" className="mt-8 text-center text-sm text-gray-400 underline">
        トップページへ戻る
      </Link>
    </main>
  );
}
