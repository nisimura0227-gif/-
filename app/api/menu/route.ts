import { NextRequest, NextResponse } from "next/server";
import { listMenuItems, addMenuItem } from "@/lib/store";
import { isAdminRequest } from "@/lib/authGuard";

export const runtime = "nodejs";

export async function GET() {
  const items = await listMenuItems();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ message: "メニュー名を入力してください。" }, { status: 400 });
  }
  const item = await addMenuItem(name);
  return NextResponse.json({ item });
}
