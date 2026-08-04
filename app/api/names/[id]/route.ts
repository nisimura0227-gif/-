import { NextRequest, NextResponse } from "next/server";
import { updateNameItem, deleteNameItem } from "@/lib/store";
import { isAdminRequest } from "@/lib/authGuard";

export const runtime = "nodejs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ message: "名前を入力してください。" }, { status: 400 });
  }
  const item = await updateNameItem(params.id, name);
  if (!item) {
    return NextResponse.json({ message: "見つかりません。" }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  await deleteNameItem(params.id);
  return NextResponse.json({ ok: true });
}
