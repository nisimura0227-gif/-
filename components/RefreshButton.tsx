"use client";

import { useRouter } from "next/navigation";

export default function RefreshButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="rounded-full border border-gray-300 px-3 py-1.5 text-xs text-gray-600 active:bg-gray-100"
    >
      🔄 更新
    </button>
  );
}
