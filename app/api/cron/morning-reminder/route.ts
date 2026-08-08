import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/store";
import { formatCutoffLabel } from "@/lib/date";
import { notifyMorningReminder } from "@/lib/notify";

export const runtime = "nodejs";

// Vercel Cron から毎朝6:30(JST)に呼ばれる想定。CRON_SECRETで保護する。
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ message: "権限がありません。" }, { status: 401 });
  }

  const settings = await getSettings();
  const cutoffLabel = formatCutoffLabel(settings.cutoffHour, settings.cutoffMinute);
  await notifyMorningReminder(cutoffLabel);

  return NextResponse.json({ ok: true });
}
