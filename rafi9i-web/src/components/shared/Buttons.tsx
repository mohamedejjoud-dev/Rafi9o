/**
 * Rafi9i — Action Buttons (Luminous Educational Edition)
 * Solid fox-orange primary CTA (ink text, like the logo) + clean outline secondary button.
 */
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-xs font-semibold gap-1.5",
  md: "h-11 px-5 text-sm font-semibold gap-2",
  lg: "h-13 px-7 text-base font-bold gap-2.5",
};

const BASE =
  "inline-flex select-none items-center justify-center whitespace-nowrap rounded-xl font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer";

const PRIMARY =
  "bg-orange-600 text-white font-bold shadow-sm shadow-orange-600/25 hover:bg-orange-700 hover:shadow-md hover:shadow-orange-600/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] border border-orange-600";

const SECONDARY =
  "border border-slate-300 bg-white text-slate-800 hover:text-slate-950 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 dark:hover:text-white shadow-xs hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]";

interface CommonProps {
  href?: string;
  size?: Size;
  className?: string;
  children: ReactNode;
  "aria-label"?: string;
}

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children" | "type"> & { type?: "button" | "submit" };

function classes(kind: "primary" | "secondary", size: Size, className: string) {
  return `${BASE} ${kind === "primary" ? PRIMARY : SECONDARY} ${SIZES[size]} ${className}`;
}

export function PrimaryButton({ href, size = "md", className = "", children, type = "button", ...rest }: ButtonProps) {
  if (href) {
    return (
      <Link href={href} className={classes("primary", size, className)} aria-label={rest["aria-label"]}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes("primary", size, className)} aria-label={rest["aria-label"]} {...rest}>
      {children}
    </button>
  );
}

export function SecondaryButton({ href, size = "md", className = "", children, type = "button", ...rest }: ButtonProps) {
  if (href) {
    return (
      <Link href={href} className={classes("secondary", size, className)} aria-label={rest["aria-label"]}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={classes("secondary", size, className)} aria-label={rest["aria-label"]} {...rest}>
      {children}
    </button>
  );
}
