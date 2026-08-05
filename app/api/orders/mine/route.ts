import { NextRequest, NextResponse } from "next/server";
import { findOrder, getSettings, orderTotal } from "@/lib/store";
import { todayStr, tomorrowStr, isTodayOrderClosed } from "@/lib/date";

export const runtime = "nodejs";

/**
 * 自分の注文状況を取得する（誰でも利用可）。
 * 名前で1件だけ引くので、他人の一覧が漏れることはない。
 * 例) /api/orders/mine?name=山田太郎&via=today
 */
export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")?.trim() ?? "";
  const via = req.nextUrl.searchParams.get("via") === "tomorrow" ? "tomorrow" : "today";

  if (!name) {
    return NextResponse.json({ message: "name is required" }, { status: 400 });
  }

  const settings = await getSettings();
  const deliveryDate = via === "today" ? todayStr() : tomorrowStr();
  const order = await findOrder(deliveryDate, name);
  const closed = via === "today" ? isTodayOrderClosed(settings.cutoffHour, settings.cutoffMinute) : false;

  return NextResponse.json({
    order: order
      ? {
          menuItem: order.menuItem,
          isLarge: order.isLarge,
          paymentMethod: order.paymentMethod,
          isPaid: order.isPaid,
          total: orderTotal(order),
          orderedAt: order.orderedAt,
        }
      : null,
    closed,
  });
}
