import { cn } from "@/lib/utils";

/** shadcn/ui 風のカード。白背景・細い枠線・角丸・控えめな影が基本形。 */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-gray-200 bg-white p-4 shadow-sm", className)}
      {...props}
    />
  );
}

export function CardSection({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t border-gray-100 pt-3", className)} {...props} />;
}
