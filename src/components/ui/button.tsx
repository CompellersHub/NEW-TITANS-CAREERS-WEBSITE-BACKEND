import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold font-sans ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary: Amber bg, White text, premium shadow
        default: "bg-tc-amber text-white shadow-[0_4px_12px_-2px_hsl(43_100%_50%/0.3)] hover:shadow-[0_8px_20px_-4px_hsl(43_100%_50%/0.4)] hover:bg-[#FFA000] hover:scale-[1.02]",
        
        // Navy button variant
        primary: "bg-tc-navy text-white shadow-[0_4px_12px_-2px_hsl(213_69%_13%/0.3)] hover:shadow-[0_8px_20px_-4px_hsl(213_69%_13%/0.4)] hover:bg-[#0D2647] hover:scale-[1.02]",
        
        // Secondary/Outline: Border Amber, white bg
        outline: "border-2 border-tc-amber bg-white text-tc-amber rounded-xl shadow-sm hover:shadow-md hover:bg-tc-amber hover:text-white transition-all duration-300",
        
        // Outline white (for dark Navy backgrounds)
        outlineWhite: "border-2 border-white text-white bg-transparent rounded-xl shadow-sm hover:shadow-md hover:bg-white hover:text-tc-navy",
        
        destructive: "bg-tc-amber text-white rounded-xl shadow-md hover:shadow-lg hover:bg-[#FFA000]",
        
        secondary: "bg-secondary text-primary rounded-xl shadow-sm hover:shadow-md hover:bg-secondary/80",
        
        ghost: "rounded-xl hover:bg-accent/10 hover:text-accent",
        
        link: "text-accent underline-offset-4 hover:underline",
        
        // Premium glass effect button
        premium: "bg-white/80 backdrop-blur-sm text-tc-navy border border-tc-amber/30 shadow-[0_4px_16px_-4px_hsl(213_69%_13%/0.08)] hover:shadow-amber-glow hover:border-tc-amber/50 hover:scale-[1.02]",
        
        // Glow effect button
        glow: "bg-gradient-to-r from-tc-amber to-tc-gold text-white shadow-amber-glow hover:shadow-[0_0_40px_hsl(43_100%_50%/0.4)] hover:scale-[1.02]",
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
