/**
 * Rafi9i — PageContainer (Developer 1 design system)
 * Consistent horizontal rhythm for every public page (72rem max).
 */
import type { ReactNode } from "react";

export default function PageContainer({
  children,
  className = "",
  dir,
}: {
  children: ReactNode;
  className?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div dir={dir} className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
