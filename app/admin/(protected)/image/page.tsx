"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { resizeImageFile, formatBytes } from "@/lib/resizeImage";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function AdminImagePage() {
  const router = useRouter();
  const [current, setCurrent] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [sizeNote, setSizeNote] = useState("");
  const [preparing, setPreparing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function load() {
    fetch("/api/image", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) =>
        setCurrent(data.image?.updatedAt ? `/api/image/file?v=${encodeURIComponent(data.image.updatedAt)}` : null)
      )
      .catch(() => setCurrent(null));
  }

  useEffect(load, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setSuccess(false);
    setError("");
    setSizeNote("");

    if (!picked) {
      setFile(null);
      setPreview(null);
      return;
    }

    setPreparing(true);
    try {
      // 送信前に自動で縮小する（スマホの写真をそのまま選んでも通るように）
      const { file: resized, originalSize, resizedSize } = await resizeImageFile(picked);
      setFile(resized);
      setPreview(URL.createObjectURL(resized));
      setSizeNote(
        resizedSize < originalSize
          ? `自動で縮小しました：${formatBytes(originalSize)} → ${formatBytes(resizedSize)}`
          : `サイズ：${formatBytes(resizedSize)}`
      );
    } catch {
      setError("画像を読み込めませんでした。別の画像でお試しください。");
      setFile(null);
      setPreview(null);
    } finally {
      setPreparing(false);
    }
  }

  async function handleUpload() {
    if (!file || uploading) return;
    setUploading(true);
    setError("");
    setSuccess(false);
    try {
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
        setSizeNote("");
        if (inputRef.current) inputRef.current.value = "";
        load();
        router.refresh();
      }
    } catch {
      setError("通信エラーが発生しました。電波状況を確認してもう一度お試しください。");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-base font-bold text-brand-dark">🖼 今週のメニュー画像</h2>

      <Card className="mb-5 bg-gray-50 text-sm text-gray-600">
        <p className="mb-1 font-bold text-gray-700">画像について</p>
        <ul className="list-inside list-disc space-y-0.5 text-xs leading-relaxed">
          <li>対応形式：JPG / PNG / WebP</li>
          <li>推奨サイズ：横1200px前後（縦横比は自由）</li>
          <li>容量制限：1.2MBまで</li>
          <li>大きい写真は自動で縮小するので、スマホで撮った写真をそのまま選んで大丈夫です</li>
        </ul>
      </Card>

      <p className="mb-2 text-sm font-semibold text-gray-600">現在の画像</p>
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={current}
          alt="現在のメニュー画像"
          className="mb-5 w-full rounded-2xl border border-gray-200 object-cover"
        />
      ) : (
        <Card className="mb-5 flex aspect-[4/3] w-full items-center justify-center border-dashed text-sm text-gray-400">
          未登録
        </Card>
      )}

      <p className="mb-2 text-sm font-semibold text-gray-600">新しい画像に差し替える</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="mb-3 w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-3 text-sm"
      />

      {preparing && <p className="mb-3 text-sm text-gray-500">画像を準備しています...</p>}
      {sizeNote && <p className="mb-3 text-xs text-gray-500">{sizeNote}</p>}

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

      <Button type="button" size="lg" className="w-full" onClick={handleUpload} disabled={!file || uploading || preparing}>
        {uploading ? "アップロード中..." : "この画像に差し替える"}
      </Button>
    </div>
  );
}
