import { NextRequest, NextResponse } from "next/server";
import { upsertLineLink } from "@/lib/store";

export const runtime = "nodejs";

// 注文ページ（LIFF）からLINEユーザーIDと名前を紐付ける（誰でも利用可・自分の紐付けのみ）
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const lineUserId = typeof body?.lineUserId === "string" ? body.lineUserId.trim() : "";
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "";

  if (!name || !lineUserId) {
    return NextResponse.json({ message: "name と lineUserId が必要です。" }, { status: 400 });
  }
  if (name.length > 20) {
    return NextResponse.json({ message: "名前は20文字以内で入力してください。" }, { status: 400 });
  }

  await upsertLineLink(name, lineUserId, displayName);
  return NextResponse.json({ ok: true });
}
