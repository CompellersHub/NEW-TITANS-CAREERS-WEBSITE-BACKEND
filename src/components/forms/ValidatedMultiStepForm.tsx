import { useState, ReactNode } from "react";
import { StepIndicator } from "./StepIndicator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { z } from "zod";

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

interface FormStep {
  id: number;
  title: string;
  description?: string;
  content: ReactNode;
  schema?: z.ZodObject<any>;
  onValidate?: () => ValidationResult;
  shouldShow?: (formData: any) => boolean;
}

interface ValidatedMultiStepFormProps {
  steps: FormStep[];
  onComplete: () => void;
  showProgress?: boolean;
  variant?: "default" | "compact" | "vertical";
  formData?: any;
  onFormDataChange?: (data: any) => void;
}

export const ValidatedMultiStepForm = ({ 
  steps, 
  onComplete, 
  showProgress = true,
  variant = "default",
  formData = {},
  onFormDataChange
}: ValidatedMultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [attemptedNext, setAttemptedNext] = useState(false);
  
  // Filter steps based on shouldShow condition
  const visibleSteps = steps.filter(step => 
    !step.shouldShow || step.shouldShow(formData)
  );
  
  const progress = ((currentStep + 1) / visibleSteps.length) * 100;

  const validateCurrentStep = (): boolean => {
    const step = visibleSteps[currentStep];
    
    if (step.onValidate) {
      const result = step.onValidate();
      
      if (!result.isValid) {
        const errorMessages = Object.values(result.errors).filter(Boolean);
        setValidationErrors(errorMessages);
        return false;
      }
    }
    
    setValidationErrors([]);
    return true;
  };

  const handleNext = () => {
    setAttemptedNext(true);
    
    if (!validateCurrentStep()) {
      return;
    }
    
    if (currentStep < visibleSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setAttemptedNext(false);
      setValidationErrors([]);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setAttemptedNext(false);
      setValidationErrors([]);
    }
  };

  return (
    <div className="w-full space-y-8">
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {visibleSteps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <StepIndicator 
        steps={visibleSteps} 
        currentStep={currentStep}
        variant={variant}
      />

      {validationErrors.length > 0 && attemptedNext && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-semibold">Please fix the following errors:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="min-h-[300px] py-8">
        {visibleSteps[currentStep].content}
      </div>

      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <Button onClick={handleNext}>
          {currentStep === visibleSteps.length - 1 ? (
            "Complete"
          ) : (
            <>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
