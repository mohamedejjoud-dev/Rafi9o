/**
 * Rafi9i — EmptyState (Developer 1 design system)
 * Friendly empty state for public lists; pairs with the ErrorState
 * already provided by Developer 2 for authenticated views.
 */
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export default function EmptyState({
  icon: Icon,
  title,
  children,
  action,
}: {
  icon?: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card/60 px-6 py-12 text-center">
      {Icon && (
        <span className="rafi-icon-chip" aria-hidden>
          <Icon className="h-5 w-5" />
        </span>
      )}
      <h3 className="mt-3 text-base font-bold text-foreground">{title}</h3>
      {children && <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted-foreground">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
