import { NextRequest, NextResponse } from "next/server";
import { getAdminName, setAdminName } from "@/lib/store";
import { isAdminRequest } from "@/lib/authGuard";

export const runtime = "nodejs";

// 現在の担当者名。トップページなど一般利用者の画面にも表示するため誰でも参照可。
export async function GET() {
  const name = await getAdminName();
  return NextResponse.json({ name });
}

// 担当者名の変更は管理者のみ。
export async function PUT(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ message: "担当者名を入力してください。" }, { status: 400 });
  }
  const saved = await setAdminName(name);
  return NextResponse.json({ name: saved });
}
