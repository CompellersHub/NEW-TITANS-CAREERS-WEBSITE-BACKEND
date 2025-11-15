import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: Amber bg, White text, glossy shadow
        default: "bg-accent text-white rounded-xl shadow-md hover:shadow-lg hover:bg-accent-hover",
        
        // Navy button variant
        primary: "bg-primary text-primary-foreground rounded-xl shadow-md hover:shadow-lg hover:bg-primary-hover",
        
        // Secondary/Outline: Border Amber, white bg
        outline: "border-2 border-accent bg-white text-accent rounded-xl shadow-sm hover:shadow-md hover:bg-accent hover:text-white",
        
        // Outline white (for dark Navy backgrounds)
        outlineWhite: "border-2 border-white text-white bg-transparent rounded-xl shadow-sm hover:shadow-md hover:bg-white hover:text-primary",
        
        destructive: "bg-accent text-white rounded-xl shadow-md hover:shadow-lg hover:bg-accent-hover",
        
        secondary: "bg-secondary text-primary rounded-xl shadow-sm hover:shadow-md hover:bg-secondary/80",
        
        ghost: "rounded-xl hover:bg-secondary hover:text-primary",
        
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
