import { buttonVariants } from "./ui/Button";

/**
 * お弁当屋へ電話するボタン。
 * スマホではタップするとそのまま発信画面が開く（tel: リンク）。
 */
export default function CallShopButton({ phone }: { phone: string }) {
  const telHref = `tel:${phone.replace(/[^0-9+]/g, "")}`;

  return (
    <a href={telHref} className={buttonVariants("outline", "lg", "min-h-[60px] w-full")}>
      📞 お弁当屋へ電話する
      <span className="text-sm font-normal text-gray-500">{phone}</span>
    </a>
  );
}
