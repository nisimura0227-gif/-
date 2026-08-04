import { NextRequest, NextResponse } from "next/server";
import { listNames, addName } from "@/lib/store";

export const runtime = "nodejs";

// 一覧取得は注文フォームからも使うため誰でも参照可
export async function GET() {
  const names = await listNames();
  return NextResponse.json({ names });
}

// 名前の登録は誰でもできる（注文フォームからの自己登録・管理画面からの登録の両方）。
// 同名（前後空白除去・大文字小文字無視）が既にある場合は addName 側で
// 重複登録せず既存の項目を返す。
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ message: "名前を入力してください。" }, { status: 400 });
  }
  const item = await addName(name);
  return NextResponse.json({ item });
}
