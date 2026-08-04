import { NextResponse } from "next/server";
import { listOrderDates } from "@/lib/store";
import { isAdminRequest } from "@/lib/authGuard";

export const runtime = "nodejs";

export async function GET() {
  if (!isAdminRequest()) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }
  const dates = await listOrderDates();
  return NextResponse.json({ dates });
}
