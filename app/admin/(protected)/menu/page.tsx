import ManageList from "@/components/ManageList";

export default function AdminMenuPage() {
  return <ManageList apiBase="/api/menu" title="🍱 メニュー管理" itemLabel="メニュー" addPlaceholder="例）唐揚げ弁当" />;
}
