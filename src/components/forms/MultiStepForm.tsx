import { useState, ReactNode } from "react";
import { StepIndicator } from "./StepIndicator";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FormStep {
  id: number;
  title: string;
  description?: string;
  content: ReactNode;
}

interface MultiStepFormProps {
  steps: FormStep[];
  onComplete: () => void;
  showProgress?: boolean;
  variant?: "default" | "compact" | "vertical";
}

export const MultiStepForm = ({ 
  steps, 
  onComplete, 
  showProgress = true,
  variant = "default" 
}: MultiStepFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full space-y-8">
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <StepIndicator 
        steps={steps} 
        currentStep={currentStep}
        variant={variant}
      />

      <div className="min-h-[300px] py-8">
        {steps[currentStep].content}
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
          {currentStep === steps.length - 1 ? (
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
