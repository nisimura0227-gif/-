import { listOrdersByDate, getSettings } from "@/lib/store";
import { todayStr, tomorrowStr, formatDateJp } from "@/lib/date";
import OrderListSection from "@/components/OrderListSection";
import RefreshButton from "@/components/RefreshButton";
import CallShopButton from "@/components/CallShopButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const today = todayStr();
  const tomorrow = tomorrowStr();
  const [todayOrders, tomorrowOrders, settings] = await Promise.all([
    listOrdersByDate(today),
    listOrdersByDate(tomorrow),
    getSettings(),
  ]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          担当者：<span className="font-bold text-gray-800">{settings.adminName}</span>
        </p>
        <RefreshButton />
      </div>

      <div className="mb-6">
        <CallShopButton phone={settings.shopPhone} />
      </div>

      <OrderListSection title="📋 今日の注文一覧" dateLabel={formatDateJp(today)} orders={todayOrders} showPayment />
      <OrderListSection
        title="📅 明日の注文一覧"
        dateLabel={formatDateJp(tomorrow)}
        orders={tomorrowOrders}
        showPayment={false}
      />
    </div>
  );
}
