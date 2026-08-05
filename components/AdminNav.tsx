"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "注文", icon: "📋" },
  { href: "/admin/history", label: "履歴", icon: "🗂" },
  { href: "/admin/menu", label: "メニュー", icon: "🍱" },
  { href: "/admin/names", label: "名前", icon: "👤" },
  { href: "/admin/image", label: "画像", icon: "🖼" },
  { href: "/admin/settings", label: "設定", icon: "⚙️" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto flex w-full max-w-md items-stretch border-t border-gray-200 bg-white">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${
              active ? "font-bold text-brand-dark" : "text-gray-400"
            }`}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
