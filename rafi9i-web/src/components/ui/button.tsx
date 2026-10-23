import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/*
 * Rafi9i button kit — warm terracotta gradient for primary actions,
 * soft lift on hover, gentle press-down on click. Everything else
 * stays quiet so the main action always reads first.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold tracking-[0.01em] transition-all duration-200 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:border-ring disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none active:translate-y-0 active:scale-[0.985] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-orange-600 to-orange-700 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_2px_rgba(56,23,16,0.18),0_6px_16px_-6px_rgba(169,84,53,0.38)] hover:-translate-y-px hover:from-orange-600 hover:to-orange-800 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_4px_rgba(56,23,16,0.16),0_10px_22px_-6px_rgba(169,84,53,0.42)]",
        destructive:
          "bg-destructive text-white shadow-[0_1px_2px_rgba(56,23,16,0.18),0_6px_16px_-6px_rgba(198,54,43,0.5)] hover:-translate-y-px hover:bg-destructive/95 focus-visible:ring-destructive/25",
        outline:
          "border border-stone-300/90 bg-white/70 text-stone-800 shadow-[0_1px_2px_rgba(56,23,16,0.05)] backdrop-blur-sm hover:-translate-y-px hover:border-orange-300 hover:bg-orange-50 hover:text-orange-900 dark:border-border dark:bg-card/70 dark:text-foreground dark:shadow-none dark:hover:border-orange-800 dark:hover:bg-orange-950/50 dark:hover:text-orange-200",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_1px_2px_rgba(56,23,16,0.06)] hover:-translate-y-px hover:bg-secondary/70 hover:text-secondary-foreground",
        ghost:
          "text-stone-700 hover:bg-orange-100/70 hover:text-orange-900 dark:text-slate-300 dark:hover:bg-orange-950/50 dark:hover:text-orange-200",
        link: "text-orange-700 underline-offset-4 hover:underline dark:text-orange-300",
      },
      size: {
        default: "h-10 px-5 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-3.5 has-[>svg]:px-3",
        lg: "h-12 rounded-2xl px-7 text-base has-[>svg]:px-6",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
