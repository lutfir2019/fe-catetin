import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border-2 border-foreground text-sm font-semibold outline-none transition active:translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-foreground shadow-doodle hover:-translate-y-0.5",
        secondary: "bg-secondary text-foreground shadow-doodle hover:-translate-y-0.5",
        success: "bg-success text-foreground shadow-doodle hover:-translate-y-0.5",
        pink: "bg-pink text-foreground shadow-doodle hover:-translate-y-0.5",
        ghost: "border-transparent bg-transparent shadow-none hover:bg-muted",
        outline: "bg-white shadow-[2px_3px_0_rgba(45,45,45,0.12)] hover:bg-muted",
        danger: "bg-expense text-foreground shadow-doodle hover:-translate-y-0.5"
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-xs",
        icon: "h-10 w-10",
        lg: "h-12 px-5 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { buttonVariants };
