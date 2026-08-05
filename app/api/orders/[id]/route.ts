import { NextRequest, NextResponse } from "next/server";
import { deleteOrder, setOrderPaid } from "@/lib/store";
import { isAdminRequest } from "@/lib/authGuard";

export const runtime = "nodejs";

// 注文を削除する（管理者のみ）
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  await deleteOrder(params.id);
  return NextResponse.json({ ok: true });
}

// 支払い済みフラグを切り替える（管理者のみ）
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (typeof body?.isPaid !== "boolean") {
    return NextResponse.json({ message: "isPaid（true/false）を指定してください。" }, { status: 400 });
  }
  const order = await setOrderPaid(params.id, body.isPaid);
  if (!order) {
    return NextResponse.json({ message: "対象の注文が見つかりません。" }, { status: 404 });
  }
  return NextResponse.json({ order });
}
