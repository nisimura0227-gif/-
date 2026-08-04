import Link from "next/link";
import { listNames, listMenuItems } from "@/lib/store";
import { tomorrowStr, formatDateJp } from "@/lib/date";
import OrderForm from "@/components/OrderForm";

export const dynamic = "force-dynamic";

export default async function TomorrowOrderPage() {
  const dateLabel = formatDateJp(tomorrowStr());
  const [names, menuItems] = await Promise.all([listNames(), listMenuItems()]);

  return (
    <main className="flex min-h-screen flex-col px-4 py-4">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-xl active:bg-gray-200">
          ←
        </Link>
        <div>
          <h1 className="text-lg font-bold text-brand-dark">📅 明日のお弁当注文</h1>
          <p className="text-xs text-gray-500">{dateLabel}分</p>
        </div>
      </header>

      {names.length === 0 || menuItems.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-gray-500">
          <p>
            {names.length === 0 ? "名前が登録されていません。" : ""}
            {menuItems.length === 0 ? "メニューが登録されていません。" : ""}
          </p>
          <p className="text-sm">管理者に登録を依頼してください。</p>
        </div>
      ) : (
        <OrderForm orderedVia="tomorrow" names={names} menuItems={menuItems} fixedPayment="手渡し" />
      )}
    </main>
  );
}
