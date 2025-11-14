import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { Loader2, ArrowLeft } from 'lucide-react';

interface PaymentFlowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle: string;
  courseSlug: string;
  price: number;
  discount?: number;
  voucherCode?: string;
  onPaymentMethodSelected: (method: string) => void;
  isProcessing?: boolean;
}

export function PaymentFlowDialog({
  open,
  onOpenChange,
  courseTitle,
  price,
  discount = 0,
  voucherCode,
  onPaymentMethodSelected,
  isProcessing = false
}: PaymentFlowDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [step, setStep] = useState<'select' | 'processing'>('select');

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleContinue = () => {
    if (selectedMethod) {
      setStep('processing');
      onPaymentMethodSelected(selectedMethod);
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedMethod('');
  };

  const finalPrice = price - discount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {step === 'select' ? 'Choose Your Payment Method' : 'Processing Payment'}
          </DialogTitle>
          <DialogDescription>
            {step === 'select' 
              ? `Select how you'd like to pay for ${courseTitle}`
              : 'Please wait while we process your payment...'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'select' ? (
          <div className="space-y-6">
            <PaymentMethodSelector
              onSelect={handleMethodSelect}
              selectedMethod={selectedMethod}
              price={price}
              discount={discount}
            />

            <div className="flex justify-between items-center pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!selectedMethod || isProcessing}
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Continue - £${finalPrice.toFixed(2)}`
                )}
              </Button>
            </div>

            {voucherCode && (
              <p className="text-sm text-center text-muted-foreground">
                Voucher code <span className="font-mono font-semibold">{voucherCode}</span> applied
              </p>
            )}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Setting up your payment...</h3>
            <p className="text-sm text-muted-foreground">
              You'll be redirected to complete your payment securely.
            </p>
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mt-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}