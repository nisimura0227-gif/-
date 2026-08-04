import { NextRequest, NextResponse } from "next/server";
import { listNames, addName } from "@/lib/store";
import { isAdminRequest } from "@/lib/authGuard";

export const runtime = "nodejs";

// 一覧取得は注文フォームからも使うため誰でも参照可
export async function GET() {
  const names = await listNames();
  return NextResponse.json({ names });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ message: "名前を入力してください。" }, { status: 400 });
  }
  const item = await addName(name);
  return NextResponse.json({ item });
}
