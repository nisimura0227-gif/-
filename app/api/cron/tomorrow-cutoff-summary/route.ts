import { NextRequest, NextResponse } from "next/server";
import { listOrdersByDate, orderTotal } from "@/lib/store";
import { tomorrowStr } from "@/lib/date";
import { notifyTomorrowCutoffSummary } from "@/lib/notify";

export const runtime = "nodejs";

// Vercel Cron から毎日15:00(JST)に呼ばれる想定（＝明日の注文の締切時刻）。CRON_SECRETで保護する。
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }

  const orders = await listOrdersByDate(tomorrowStr());

  const breakdown = new Map<string, number>();
  for (const o of orders) breakdown.set(o.menuItem, (breakdown.get(o.menuItem) ?? 0) + 1);

  await notifyTomorrowCutoffSummary({
    count: orders.length,
    menuBreakdown: Array.from(breakdown.entries()).map(([menuItem, count]) => ({ menuItem, count })),
    totalAmount: orders.reduce((sum, o) => sum + orderTotal(o), 0),
    paidCount: orders.filter((o) => o.paymentStatus === "paid").length,
    claimedCount: orders.filter((o) => o.paymentStatus === "claimed").length,
    unpaidCount: orders.filter((o) => o.paymentStatus === "unpaid").length,
  });

  return NextResponse.json({ ok: true });
}
