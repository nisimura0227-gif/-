import { NextRequest, NextResponse } from "next/server";
import { findOrder, getSettings, orderTotal, deleteOrder } from "@/lib/store";
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
  const cutoffHour = via === "today" ? settings.cutoffHour : settings.tomorrowCutoffHour;
  const cutoffMinute = via === "today" ? settings.cutoffMinute : settings.tomorrowCutoffMinute;
  const closed = isTodayOrderClosed(cutoffHour, cutoffMinute);

  return NextResponse.json({
    order: order
      ? {
          menuItem: order.menuItem,
          isLarge: order.isLarge,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          total: orderTotal(order),
          orderedAt: order.orderedAt,
        }
      : null,
    closed,
  });
}

/**
 * 自分の注文をキャンセルする（誰でも利用可・締切前のみ）。
 * 例) DELETE /api/orders/mine?name=山田太郎&via=today
 */
export async function DELETE(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name")?.trim() ?? "";
  const via = req.nextUrl.searchParams.get("via") === "tomorrow" ? "tomorrow" : "today";

  if (!name) {
    return NextResponse.json({ message: "name is required" }, { status: 400 });
  }

  const settings = await getSettings();
  const deliveryDate = via === "today" ? todayStr() : tomorrowStr();
  const cutoffHour = via === "today" ? settings.cutoffHour : settings.tomorrowCutoffHour;
  const cutoffMinute = via === "today" ? settings.cutoffMinute : settings.tomorrowCutoffMinute;

  if (isTodayOrderClosed(cutoffHour, cutoffMinute)) {
    return NextResponse.json({ message: "受付時間を過ぎたため、キャンセルできません。" }, { status: 403 });
  }

  const order = await findOrder(deliveryDate, name);
  if (!order) {
    return NextResponse.json({ message: "対象の注文が見つかりません。" }, { status: 404 });
  }
  await deleteOrder(order.id);
  return NextResponse.json({ ok: true });
}
