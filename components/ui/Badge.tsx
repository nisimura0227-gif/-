import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "neutral" | "danger";

const VARIANTS: Record<BadgeVariant, string> = {
  success: "bg-brand-light text-brand-dark",
  warning: "bg-amber-50 text-amber-700",
  neutral: "bg-gray-100 text-gray-600",
  danger: "bg-red-50 text-red-600",
};

export function Badge({
  variant = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-sm font-bold",
        VARIANTS[variant],
        className
      )}
      {...props}
    />
  );
}
