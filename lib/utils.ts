import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * クラス名を安全に結合するユーティリティ（shadcn/ui と同じ定番パターン）。
 * 条件付きクラスの結合と、Tailwindクラスの重複解決（例: "px-2 px-4" -> "px-4"）を行う。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
