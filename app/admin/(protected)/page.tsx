import { listOrdersByDate } from "@/lib/store";
import { todayStr, tomorrowStr, formatDateJp } from "@/lib/date";
import OrderListSection from "@/components/OrderListSection";
import RefreshButton from "@/components/RefreshButton";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const today = todayStr();
  const tomorrow = tomorrowStr();
  const [todayOrders, tomorrowOrders] = await Promise.all([
    listOrdersByDate(today),
    listOrdersByDate(tomorrow),
  ]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">最新の注文状況</p>
        <RefreshButton />
      </div>
      <OrderListSection
        title="📋 今日の注文一覧"
        dateLabel={formatDateJp(today)}
        orders={todayOrders}
        showPayment
      />
      <OrderListSection
        title="📅 明日の注文一覧"
        dateLabel={formatDateJp(tomorrow)}
        orders={tomorrowOrders}
        showPayment={false}
      />
    </div>
  );
}
