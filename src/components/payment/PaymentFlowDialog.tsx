import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PaymentMethodSelector } from './PaymentMethodSelector';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';

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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToRefund, setAgreedToRefund] = useState(false);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleContinue = () => {
    if (selectedMethod && agreedToTerms && agreedToPrivacy && agreedToRefund) {
      setStep('processing');
      onPaymentMethodSelected(selectedMethod);
    }
  };
  
  const canContinue = selectedMethod && agreedToTerms && agreedToPrivacy && agreedToRefund;

  const handleBack = () => {
    setStep('select');
    setSelectedMethod('');
  };

  const finalPrice = price - discount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-accent/5">
        <DialogHeader className="border-b-2 border-accent/20 pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
            {step === 'select' ? 'Choose Your Payment Method' : 'Processing Payment'}
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            {step === 'select' 
              ? `Select how you'd like to pay for ${courseTitle}`
              : 'Please wait while we process your payment...'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'select' ? (
          <div className="space-y-6 pt-4">
            <PaymentMethodSelector
              onSelect={handleMethodSelect}
              selectedMethod={selectedMethod}
              price={price}
              discount={discount}
            />

            {(agreedToTerms && agreedToPrivacy && agreedToRefund && !selectedMethod) && (
              <div className="text-sm font-semibold text-destructive/90 bg-destructive/5 border border-destructive/20 rounded-md p-3">
                Please select a payment method above to continue.
              </div>
            )}


            {/* Legal Agreements */}
            <div className="space-y-4 p-6 bg-gradient-to-br from-muted/30 to-secondary/20 rounded-xl border-2 border-accent/20">
              <h3 className="font-bold text-lg text-foreground mb-4">Before You Continue</h3>
              
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                />
                <label htmlFor="terms" className="text-sm font-medium leading-relaxed cursor-pointer">
                  I agree to the{' '}
                  <a 
                    href="/terms-conditions" 
                    target="_blank" 
                    className="text-accent hover:text-gold underline font-semibold inline-flex items-center gap-1"
                  >
                    Terms & Conditions
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="privacy"
                  checked={agreedToPrivacy}
                  onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
                />
                <label htmlFor="privacy" className="text-sm font-medium leading-relaxed cursor-pointer">
                  I have read and agree to the{' '}
                  <a 
                    href="/privacy-policy" 
                    target="_blank" 
                    className="text-accent hover:text-gold underline font-semibold inline-flex items-center gap-1"
                  >
                    Privacy Policy
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="refund"
                  checked={agreedToRefund}
                  onCheckedChange={(checked) => setAgreedToRefund(checked as boolean)}
                />
                <label htmlFor="refund" className="text-sm font-medium leading-relaxed cursor-pointer">
                  I understand the{' '}
                  <a 
                    href="/refund-policy" 
                    target="_blank" 
                    className="text-accent hover:text-gold underline font-semibold inline-flex items-center gap-1"
                  >
                    Refund Policy
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isProcessing}
                className="flex-1 h-12 font-semibold border-2 hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                disabled={!canContinue || isProcessing}
                className="flex-1 h-12 font-bold text-base bg-gradient-to-r from-accent to-gold hover:from-accent/90 hover:to-gold/90 text-primary shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Continue - £${finalPrice.toFixed(2)}`
                )}
              </Button>
            </div>

            {voucherCode && (
              <div className="text-center py-3 px-4 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
                <p className="text-sm font-semibold text-success">
                  ✓ Voucher code <span className="font-mono font-bold">{voucherCode}</span> applied
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-gold rounded-full blur-xl opacity-50 animate-pulse" />
              <Loader2 className="relative h-16 w-16 animate-spin text-accent mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-3 bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Setting up your payment...
            </h3>
            <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto">
              You'll be redirected to complete your payment securely.
            </p>
            <Button
              variant="outline"
              onClick={handleBack}
              className="mt-8 font-semibold border-2"
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