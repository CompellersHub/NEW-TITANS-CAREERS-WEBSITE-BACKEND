import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Amber bg (#FFB000), Navy text (#0B1F3B), bold
        default: "bg-accent text-accent-foreground rounded-xl shadow-[0_4px_12px_-4px_hsl(var(--accent)/0.3)] hover:bg-accent/90 hover:shadow-[0_6px_16px_-4px_hsl(var(--accent)/0.4)]",
        
        // Navy button variant
        primary: "bg-primary text-primary-foreground rounded-xl shadow-[0_2px_8px_-2px_hsl(var(--primary)/0.2)] hover:bg-primary-hover",
        
        // Secondary/Outline: Border Amber, transparent bg
        outline: "border-2 border-accent bg-transparent text-accent rounded-xl hover:bg-accent hover:text-accent-foreground",
        
        // Outline white (for dark backgrounds)
        outlineWhite: "border-2 border-white text-white bg-transparent rounded-xl hover:bg-white hover:text-primary",
        
        destructive: "bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90",
        
        secondary: "bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80",
        
        ghost: "rounded-xl hover:bg-accent/10 hover:text-accent",
        
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-sm",
        lg: "h-14 px-8 py-4 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
