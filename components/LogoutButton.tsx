"use client";

import { useRouter } from "next/navigation";
import { buttonVariants } from "./ui/Button";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} className={buttonVariants("ghost", "sm")}>
      🚪 ログアウト
    </button>
  );
}
