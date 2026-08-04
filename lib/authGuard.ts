import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidSessionToken } from "@/lib/auth";

export function isAdminRequest(): boolean {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  return isValidSessionToken(token);
}
