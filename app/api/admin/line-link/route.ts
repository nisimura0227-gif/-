import { NextRequest, NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/store";
import { isAdminRequest } from "@/lib/authGuard";

export const runtime = "nodejs";

// 管理画面にログイン済みの人だけが、自分のLINEアカウントを
// 「管理者通知の受け取り先」として登録できる（複数人登録可＝管理者不在時の保険）。
export async function POST(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const lineUserId = typeof body?.lineUserId === "string" ? body.lineUserId.trim() : "";
  const displayName = typeof body?.displayName === "string" ? body.displayName.trim() : "（表示名なし）";
  if (!lineUserId) {
    return NextResponse.json({ message: "lineUserId is required" }, { status: 400 });
  }

  const settings = await getSettings();
  const others = settings.adminLineUsers.filter((u) => u.lineUserId !== lineUserId);
  const nextSettings = await saveSettings({
    adminLineUsers: [...others, { lineUserId, displayName }],
  });

  return NextResponse.json({ adminLineUsers: nextSettings.adminLineUsers });
}

// 管理者通知先から外す
export async function DELETE(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const lineUserId = typeof body?.lineUserId === "string" ? body.lineUserId.trim() : "";
  if (!lineUserId) {
    return NextResponse.json({ message: "lineUserId is required" }, { status: 400 });
  }

  const settings = await getSettings();
  const nextSettings = await saveSettings({
    adminLineUsers: settings.adminLineUsers.filter((u) => u.lineUserId !== lineUserId),
  });
  return NextResponse.json({ adminLineUsers: nextSettings.adminLineUsers });
}
