import { NextResponse } from "next/server";
import { resetOrders } from "@/lib/store";
import { isAdminRequest } from "@/lib/authGuard";

export const runtime = "nodejs";

// 今週の注文データを全てリセットする（管理者のみ）。
// 名前の登録データはリセットされない。
export async function POST() {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  await resetOrders();
  return NextResponse.json({ ok: true });
}
