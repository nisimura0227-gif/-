import { NextRequest, NextResponse } from "next/server";
import { updateMenuItem, deleteMenuItem } from "@/lib/store";
import { isAdminRequest } from "@/lib/authGuard";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const price = typeof body?.price === "number" ? body.price : Number(body?.price);
  if (!name) {
    return NextResponse.json({ message: "メニュー名を入力してください。" }, { status: 400 });
  }
  if (!Number.isFinite(price) || price < 0) {
    return NextResponse.json({ message: "金額を正しく入力してください。" }, { status: 400 });
  }
  const item = await updateMenuItem(params.id, name, price);
  if (!item) {
    return NextResponse.json({ message: "見つかりません。" }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  await deleteMenuItem(params.id);
  return NextResponse.json({ ok: true });
}
