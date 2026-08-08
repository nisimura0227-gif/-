import { NextRequest, NextResponse } from "next/server";
import { deleteOrder, setOrderPaymentStatus } from "@/lib/store";
import { isAdminRequest } from "@/lib/authGuard";
import { notifyUserPaymentConfirmed } from "@/lib/notify";

export const runtime = "nodejs";

// 注文を削除する（管理者のみ）
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  await deleteOrder(params.id);
  return NextResponse.json({ ok: true });
}

// 支払い状況を変更する（管理者のみ。サイトから直接確定・取り消しができる）
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const status = body?.paymentStatus;
  if (status !== "unpaid" && status !== "claimed" && status !== "paid") {
    return NextResponse.json(
      { message: "paymentStatus（unpaid/claimed/paid）を指定してください。" },
      { status: 400 }
    );
  }
  const order = await setOrderPaymentStatus(params.id, status);
  if (!order) {
    return NextResponse.json({ message: "対象の注文が見つかりません。" }, { status: 404 });
  }
  if (status === "paid") {
    notifyUserPaymentConfirmed(order).catch(() => {});
  }
  return NextResponse.json({ order });
}
