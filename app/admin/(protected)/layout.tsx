import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isValidSessionToken } from "@/lib/auth";
import AdminNav from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(ADMIN_COOKIE)?.value;
  if (!isValidSessionToken(token)) {
    redirect("/admin/login");
  }

  return (
    <main className="flex min-h-screen flex-col pb-24">
      <header className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h1 className="text-base font-bold text-brand-dark">🛠 管理画面</h1>
      </header>
      <div className="flex-1 px-4 py-4">{children}</div>
      <AdminNav />
    </main>
  );
}
