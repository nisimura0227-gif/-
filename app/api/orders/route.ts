import { NextRequest, NextResponse } from "next/server";
import { listOrdersByDate, upsertOrder, addName } from "@/lib/store";
import { isAdminRequest } from "@/lib/authGuard";
import { isTodayOrderClosed, todayStr, tomorrowStr } from "@/lib/date";

export const runtime = "nodejs";

// 管理画面から特定日の注文一覧を取得
export async function GET(req: NextRequest) {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  const date = req.nextUrl.searchParams.get("date");
  if (!date) {
    return NextResponse.json({ message: "date is required" }, { status: 400 });
  }
  const orders = await listOrdersByDate(date);
  return NextResponse.json({ orders });
}

// 注文フォームからの注文登録（誰でも利用可）
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const orderedVia = body?.orderedVia === "tomorrow" ? "tomorrow" : "today";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const menuItem = typeof body?.menuItem === "string" ? body.menuItem.trim() : "";
  const isLarge = body?.isLarge === true;
  let paymentMethod = typeof body?.paymentMethod === "string" ? body.paymentMethod.trim() : "";

  if (!name || !menuItem) {
    return NextResponse.json({ message: "名前とメニューを選択してください。" }, { status: 400 });
  }

  const expectedDate = orderedVia === "today" ? todayStr() : tomorrowStr();

  if (orderedVia === "today") {
    if (isTodayOrderClosed()) {
      return NextResponse.json({ message: "本日の受付は終了しました。" }, { status: 403 });
    }
    if (!paymentMethod) {
      return NextResponse.json({ message: "支払い方法を選択してください。" }, { status: 400 });
    }
  } else {
    // 明日の注文は「手渡し」固定
    paymentMethod = "手渡し";
  }

  // 名前は自己登録できる。既に同名があれば addName 内で重複登録されない。
  await addName(name);

  const order = await upsertOrder({
    deliveryDate: expectedDate,
    orderedVia,
    name,
    menuItem,
    isLarge,
    paymentMethod,
  });

  return NextResponse.json({ order });
}
