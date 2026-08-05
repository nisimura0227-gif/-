// アップロード前に画像をブラウザ内で縮小するためのヘルパー。
//
// スマホで撮った写真はそのままだと数MBあり、保存先の容量制限を超えてしまう。
// 送信前に長辺1600pxまで縮小しJPEGへ変換することで、
// 画質を保ちながら通常200〜500KB程度に収まるようにしている。
// （現場では通信環境が悪いことも多いため、軽くしておく効果も大きい）

const MAX_EDGE = 1600;
const QUALITY = 0.82;

export type ResizeResult = { file: File; originalSize: number; resizedSize: number };

export async function resizeImageFile(file: File): Promise<ResizeResult> {
  // 変換できない環境ではそのまま返す（機能が止まらないようにする）
  if (typeof document === "undefined" || !file.type.startsWith("image/")) {
    return { file, originalSize: file.size, resizedSize: file.size };
  }

  try {
    const bitmap = await loadImage(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return { file, originalSize: file.size, resizedSize: file.size };

    // 透過PNGが黒くならないよう、背景を白で塗ってから描画する
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITY)
    );
    if (!blob) return { file, originalSize: file.size, resizedSize: file.size };

    // 縮小しても大きくなってしまう場合は元のファイルを使う
    if (blob.size >= file.size) {
      return { file, originalSize: file.size, resizedSize: file.size };
    }

    const resized = new File([blob], replaceExt(file.name), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
    return { file: resized, originalSize: file.size, resizedSize: resized.size };
  } catch {
    return { file, originalSize: file.size, resizedSize: file.size };
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像を読み込めませんでした"));
    };
    img.src = url;
  });
}

function replaceExt(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  return `${base || "menu"}.jpg`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
