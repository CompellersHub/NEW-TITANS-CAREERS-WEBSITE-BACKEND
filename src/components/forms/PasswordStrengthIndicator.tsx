import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordRequirement {
  label: string;
  met: boolean;
}

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export const PasswordStrengthIndicator = ({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) => {
  const requirements = useMemo((): PasswordRequirement[] => {
    return [
      {
        label: "At least 8 characters",
        met: password.length >= 8
      },
      {
        label: "Contains uppercase letter",
        met: /[A-Z]/.test(password)
      },
      {
        label: "Contains lowercase letter",
        met: /[a-z]/.test(password)
      },
      {
        label: "Contains number",
        met: /\d/.test(password)
      },
      {
        label: "Contains special character",
        met: /[!@#$%^&*(),.?":{}|<>]/.test(password)
      }
    ];
  }, [password]);

  const strength = useMemo(() => {
    if (!password) return { score: 0, label: "", color: "bg-muted" };
    
    const metCount = requirements.filter(r => r.met).length;
    const percentage = (metCount / requirements.length) * 100;
    
    if (metCount <= 2) {
      return { score: percentage, label: "Weak", color: "bg-destructive" };
    } else if (metCount === 3) {
      return { score: percentage, label: "Fair", color: "bg-orange-500" };
    } else if (metCount === 4) {
      return { score: percentage, label: "Good", color: "bg-yellow-500" };
    } else {
      return { score: percentage, label: "Strong", color: "bg-green-600" };
    }
  }, [requirements, password]);

  if (!password) return null;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Password Strength:</span>
          <span className={cn(
            "font-semibold",
            strength.label === "Weak" && "text-destructive",
            strength.label === "Fair" && "text-orange-500",
            strength.label === "Good" && "text-yellow-500",
            strength.label === "Strong" && "text-green-600"
          )}>
            {strength.label}
          </span>
        </div>
        <Progress 
          value={strength.score} 
          className="h-2"
          indicatorClassName={strength.color}
        />
      </div>

      {showRequirements && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Requirements:</p>
          <ul className="space-y-1.5">
            {requirements.map((req, index) => (
              <li 
                key={index}
                className={cn(
                  "flex items-center gap-2 text-sm transition-colors",
                  req.met ? "text-green-600" : "text-muted-foreground"
                )}
              >
                {req.met ? (
                  <Check className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <X className="h-4 w-4 flex-shrink-0" />
                )}
                <span>{req.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
