import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface FormFieldProps {
  label: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  children: ReactNode;
  htmlFor?: string;
}

export const FormField = ({ 
  label, 
  error, 
  success, 
  required, 
  children,
  htmlFor 
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label 
          htmlFor={htmlFor}
          className={cn(
            "font-semibold",
            error && "text-destructive"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {success && !error && (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        )}
      </div>
      
      <div className={cn(
        "relative",
        error && "animate-shake"
      )}>
        {children}
      </div>
      
      {error && (
        <div className="flex items-start gap-2 text-sm text-destructive animate-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
