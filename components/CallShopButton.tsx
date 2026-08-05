/**
 * お弁当屋へ電話するボタン。
 * スマホではタップするとそのまま発信画面が開く（tel: リンク）。
 */
export default function CallShopButton({ phone }: { phone: string }) {
  const telHref = `tel:${phone.replace(/[^0-9+]/g, "")}`;

  return (
    <a
      href={telHref}
      className="flex min-h-[60px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-brand bg-white px-6 py-4 text-lg font-bold text-brand-dark active:bg-brand-light"
    >
      📞 お弁当屋へ電話する
      <span className="text-sm font-normal text-gray-500">{phone}</span>
    </a>
  );
}
