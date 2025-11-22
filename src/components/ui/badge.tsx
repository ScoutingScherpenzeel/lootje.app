import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border-4  border-black justify-center text-xs font-black uppercase w-fit shrink-0 [&>svg]:size-4 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-black text-white",
        success: "bg-green-400 text-black",
        destructive: "bg-red-500 text-white",
        outline: "bg-white text-black",
        yellow: "bg-yellow-400 text-black",
      },
      size: {
        default: "px-3 py-1",
        small: "px-2 py-0.5",
        large: "px-4 py-1 text-sm",
        xl: "px-4 py-2 text-md shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] [&>svg]:size-5",
        "2xl":
          "px-5 py-2 text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] [&>svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
