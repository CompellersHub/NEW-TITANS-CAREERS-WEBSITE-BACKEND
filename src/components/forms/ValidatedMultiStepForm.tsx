import { useState, ReactNode, useEffect, cloneElement, isValidElement } from "react";
import { StepIndicator } from "./StepIndicator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useFormAnalytics } from "@/hooks/useFormAnalytics";

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
  formName?: string;
  userEmail?: string;
}

export const ValidatedMultiStepForm = ({ 
  steps, 
  onComplete, 
  showProgress = true,
  variant = "default",
  formData = {},
  onFormDataChange,
  formName = "multi-step-form",
  userEmail
}: ValidatedMultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [attemptedNext, setAttemptedNext] = useState(false);
  
  const analytics = useFormAnalytics(formName);
  
  // Filter steps based on shouldShow condition
  const visibleSteps = steps.filter(step => 
    !step.shouldShow || step.shouldShow(formData)
  );
  
  const progress = ((currentStep + 1) / visibleSteps.length) * 100;
  
  // Track step abandonment when step changes
  const previousStepRef = useState(currentStep);
  useEffect(() => {
    if (previousStepRef[0] !== currentStep && previousStepRef[0] < currentStep) {
      const previousStep = visibleSteps[previousStepRef[0]];
      analytics.trackStepComplete(previousStepRef[0], previousStep.title);
    }
    previousStepRef[1](currentStep);
  }, [currentStep, visibleSteps, analytics]);

  const validateCurrentStep = (): boolean => {
    const step = visibleSteps[currentStep];
    
    if (step.onValidate) {
      const result = step.onValidate();
      
      if (!result.isValid) {
        const errorMessages = Object.values(result.errors).filter(Boolean);
        setValidationErrors(errorMessages);
        
        // Track validation errors
        Object.entries(result.errors).forEach(([fieldName, errorMessage]) => {
          if (errorMessage) {
            analytics.trackFieldError(fieldName, errorMessage, currentStep, step.title);
          }
        });
        
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
      analytics.trackFormComplete(userEmail);
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
        {enhanceContentWithTracking(
          visibleSteps[currentStep].content, 
          currentStep, 
          visibleSteps[currentStep].title,
          analytics
        )}
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

// Helper function to enhance form content with analytics tracking
function enhanceContentWithTracking(
  content: ReactNode, 
  stepNumber: number, 
  stepTitle: string,
  analytics: ReturnType<typeof useFormAnalytics>
): ReactNode {
  if (!isValidElement(content)) {
    return content;
  }

  // Recursively process children
  const enhanceChildren = (children: ReactNode): ReactNode => {
    if (!children) return children;

    return cloneElement(content as any, {
      children: Array.isArray(children)
        ? children.map((child, index) => {
            if (isValidElement(child)) {
              const props = child.props as any;
              
              // Track input fields (Input, Textarea, Select, etc.)
              if (props.id || props.name) {
                const fieldName = props.id || props.name;
                
                return cloneElement(child, {
                  ...props,
                  onFocus: (e: any) => {
                    analytics.trackFieldFocus(fieldName, stepNumber, stepTitle);
                    props.onFocus?.(e);
                  },
                  onBlur: (e: any) => {
                    analytics.trackFieldBlur(fieldName, stepNumber, stepTitle);
                    props.onBlur?.(e);
                  },
                });
              }
              
              // Recursively process nested children
              if (props.children) {
                return cloneElement(child, {
                  ...props,
                  children: enhanceChildren(props.children),
                });
              }
            }
            return child;
          })
        : enhanceChildren(children)
    });
  };

  return enhanceChildren(content);
}
