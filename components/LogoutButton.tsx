"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-gray-300 px-3 py-1.5 text-xs text-gray-600 active:bg-gray-100"
    >
      🚪 ログアウト
    </button>
  );
}
