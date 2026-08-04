// 日本時間(JST)まわりのユーティリティ。
// サーバーのタイムゾーン設定に依存しないよう、常に Intl.DateTimeFormat で
// Asia/Tokyo を明示して計算する。

const TZ = "Asia/Tokyo";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export type JstParts = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number;
  second: number;
};

export function getJstParts(date: Date = new Date()): JstParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  let hour = Number(map.hour);
  if (hour === 24) hour = 0;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour,
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

// "YYYY-MM-DD" 形式（JST基準）
export function dateStrFromParts(p: { year: number; month: number; day: number }): string {
  return `${p.year}-${pad2(p.month)}-${pad2(p.day)}`;
}

export function todayStr(now: Date = new Date()): string {
  return dateStrFromParts(getJstParts(now));
}

export function tomorrowStr(now: Date = new Date()): string {
  const p = getJstParts(now);
  // 日付だけのUTC基準Dateで1日進める（JSTにはDSTが無いので安全）
  const asUtc = Date.UTC(p.year, p.month - 1, p.day);
  const next = new Date(asUtc + 24 * 60 * 60 * 1000);
  return `${next.getUTCFullYear()}-${pad2(next.getUTCMonth() + 1)}-${pad2(next.getUTCDate())}`;
}

// HH:MM (JST)
export function formatTimeHm(date: Date = new Date()): string {
  const p = getJstParts(date);
  return `${pad2(p.hour)}:${pad2(p.minute)}`;
}

const WEEKDAYS_JP = ["日", "月", "火", "水", "木", "金", "土"];

// "YYYY-MM-DD" -> "8月4日(火)"
export function formatDateJp(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d));
  const w = WEEKDAYS_JP[utc.getUTCDay()];
  return `${m}月${d}日(${w})`;
}

// 本日の受付締切（デフォルト 7:55 JST）を過ぎたかどうか
export function isTodayOrderClosed(cutoffHour = 7, cutoffMinute = 55, now: Date = new Date()): boolean {
  const p = getJstParts(now);
  const nowMinutes = p.hour * 60 + p.minute;
  const cutoffMinutes = cutoffHour * 60 + cutoffMinute;
  return nowMinutes >= cutoffMinutes;
}

export const ORDER_CUTOFF_LABEL = "7:55";
