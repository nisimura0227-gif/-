import Link from "next/link";

export default function BigLinkButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const base =
    "flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-5 text-xl font-bold shadow-sm active:scale-[0.98] transition";
  const style =
    variant === "primary"
      ? "bg-brand text-white active:bg-brand-dark"
      : "bg-brand-light text-brand-dark border-2 border-brand";
  return (
    <Link href={href} className={`${base} ${style}`}>
      {children}
    </Link>
  );
}
