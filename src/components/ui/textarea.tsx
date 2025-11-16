import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border-2 border-border bg-white px-4 py-3 text-sm transition-all duration-300 placeholder:text-muted-foreground hover:border-tc-gold focus-visible:outline-none focus-visible:border-tc-amber focus-visible:ring-2 focus-visible:ring-tc-amber/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
