"use client";

import { useEffect, useRef, useState } from "react";

export default function AdminImagePage() {
  const [current, setCurrent] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function load() {
    fetch("/api/image")
      .then((r) => r.json())
      .then((data) =>
        setCurrent(data.image?.updatedAt ? `/api/image/file?v=${encodeURIComponent(data.image.updatedAt)}` : null)
      );
  }

  useEffect(load, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setSuccess(false);
    setError("");
    if (f) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess(false);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/image", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message || "アップロードに失敗しました。");
    } else {
      setSuccess(true);
      setFile(null);
      setPreview(null);
      if (inputRef.current) inputRef.current.value = "";
      load();
    }
    setUploading(false);
  }

  return (
    <div>
      <h2 className="mb-4 text-base font-bold text-brand-dark">🖼 今週のメニュー画像</h2>

      <p className="mb-2 text-sm font-semibold text-gray-600">現在の画像</p>
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={current} alt="現在のメニュー画像" className="mb-5 w-full rounded-2xl border border-gray-200 object-cover" />
      ) : (
        <div className="mb-5 flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-400">
          未登録
        </div>
      )}

      <p className="mb-2 text-sm font-semibold text-gray-600">新しい画像に差し替える</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="mb-4 w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-3 text-sm"
      />

      {preview && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-semibold text-gray-600">プレビュー</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="プレビュー" className="w-full rounded-2xl border border-gray-200 object-cover" />
        </div>
      )}

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
      {success && (
        <p className="mb-4 rounded-lg bg-brand-light px-4 py-3 text-sm font-semibold text-brand-dark">
          画像を更新しました。
        </p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full rounded-2xl bg-brand px-6 py-4 text-lg font-bold text-white shadow-sm active:bg-brand-dark disabled:bg-gray-300"
      >
        {uploading ? "アップロード中..." : "この画像に差し替える"}
      </button>
    </div>
  );
}
