"use client";

import { useRouter } from "next/navigation";
import { buttonVariants } from "./ui/Button";

export default function RefreshButton() {
  const router = useRouter();
  return (
    <button type="button" onClick={() => router.refresh()} className={buttonVariants("ghost", "sm")}>
      🔄 更新
    </button>
  );
}
