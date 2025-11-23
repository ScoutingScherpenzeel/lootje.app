import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md border-4 border-black text-sm font-black whitespace-nowrap uppercase transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-black text-white hover:bg-gray-900",
        outline: "bg-white text-black hover:bg-gray-200",
        success: "bg-green-400 text-black hover:bg-green-300",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        yellow: "bg-yellow-400 text-black hover:bg-yellow-300",
      },
      size: {
        sm: "h-10 px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] has-[>svg]:px-2.5",
        default:
          "h-12 px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] has-[>svg]:px-3",
        lg: "h-14 px-4 py-2 text-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] has-[>svg]:px-4",
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
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
