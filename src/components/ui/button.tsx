import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap border-2 border-brand-dark text-[10px] font-black uppercase tracking-[0.18em] outline-none transition-all duration-200 focus-visible:ring-4 focus-visible:ring-brand-dark/25 disabled:pointer-events-none disabled:opacity-35 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-brand-dark text-white hover:bg-brand-yellow hover:text-brand-dark",
        primary:
          "bg-brand-dark text-white hover:bg-brand-yellow hover:text-brand-dark",
        secondary:
          "bg-white text-brand-dark hover:bg-brand-yellow hover:shadow-[4px_4px_0_0_#202621]",
        yellow:
          "bg-brand-yellow text-brand-dark hover:bg-white hover:shadow-[4px_4px_0_0_#202621]",
        active: "bg-brand-yellow text-brand-dark shadow-[4px_4px_0_0_#202621]",
        copied: "bg-brand-yellow text-brand-dark",
        destructive:
          "bg-[#ff5f57] text-brand-dark hover:bg-white hover:text-brand-dark",
        ghost:
          "border-transparent bg-transparent text-brand-dark hover:border-brand-dark hover:bg-brand-yellow",
        outline:
          "bg-transparent text-brand-dark hover:bg-brand-dark hover:text-white",
        muted:
          "bg-brand-grey text-brand-dark hover:bg-brand-dark hover:text-white",
        link: "border-transparent bg-transparent px-0 text-brand-dark underline decoration-2 underline-offset-4 hover:opacity-60",
      },
      size: {
        default: "min-h-11 px-5 py-3",
        sm: "min-h-9 px-3 py-2 text-[9px]",
        lg: "min-h-14 px-7 py-4 text-xs",
        icon: "size-11 p-0",
        "icon-sm": "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" /> : null}
      {children}
    </Comp>
  );
}

export { Button, buttonVariants };
