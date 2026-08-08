import { NextRequest, NextResponse } from "next/server";
import { claimOrderPaid } from "@/lib/store";
import { todayStr, tomorrowStr } from "@/lib/date";
import { notifyAdminPaymentClaimed } from "@/lib/notify";

export const runtime = "nodejs";

/**
 * 本人が「支払いました」と申告する（誰でも利用可）。
 * これだけでは支払い済みにならない。管理者がLINEで「受け取り確認」を
 * 押すまでは paymentStatus は "claimed"（確認待ち）のまま。
 * 既に claimed / paid の場合は何もしない（冪等・多重通知防止）。
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const via = body?.orderedVia === "tomorrow" ? "tomorrow" : "today";

  if (!name) {
    return NextResponse.json({ message: "name is required" }, { status: 400 });
  }

  const deliveryDate = via === "today" ? todayStr() : tomorrowStr();
  const result = await claimOrderPaid(deliveryDate, name);
  if (!result) {
    return NextResponse.json({ message: "対象の注文が見つかりません。" }, { status: 404 });
  }

  if (result.changed) {
    notifyAdminPaymentClaimed(result.order).catch(() => {});
  }

  return NextResponse.json({ order: result.order });
}
