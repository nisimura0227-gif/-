// 管理者ログイン用の簡易セッション管理。
// 社内・現場内での利用を想定した簡易的な保護であり、
// 高いセキュリティが求められる用途には向かない点に留意。

import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "bento_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12時間

function getSecret(): string {
  return process.env.SESSION_SECRET || "insecure-default-secret-change-me";
}

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export function createSessionToken(): string {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = String(expires);
  const sig = createHmac("sha256", getSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function isValidSessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = createHmac("sha256", getSecret()).update(payload).digest("hex");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const expires = Number(payload);
  if (Number.isNaN(expires)) return false;
  return Date.now() < expires;
}

export function checkAdminPassword(password: string): boolean {
  const correct = getAdminPassword();
  const a = Buffer.from(password);
  const b = Buffer.from(correct);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
