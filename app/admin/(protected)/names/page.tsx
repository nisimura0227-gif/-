import ManageList from "@/components/ManageList";

export default function AdminNamesPage() {
  return <ManageList apiBase="/api/names" title="👤 名前管理" itemLabel="名前" addPlaceholder="例）山田太郎" />;
}
