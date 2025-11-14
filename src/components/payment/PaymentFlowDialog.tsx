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
import { paymentMethods } from './PaymentMethodCard';
import { Loader2, ArrowLeft, ArrowRight, ExternalLink, Check } from 'lucide-react';

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
  const [step, setStep] = useState<'select' | 'review' | 'processing'>('select');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToRefund, setAgreedToRefund] = useState(false);

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleContinue = () => {
    if (selectedMethod && agreedToTerms && agreedToPrivacy && agreedToRefund) {
      setStep('review');
    }
  };

  const handleConfirmPayment = () => {
    setStep('processing');
    onPaymentMethodSelected(selectedMethod);
  };
  
  const canContinue = selectedMethod && agreedToTerms && agreedToPrivacy && agreedToRefund;

  const handleBack = () => {
    if (step === 'review') {
      setStep('select');
    } else if (step === 'processing') {
      setStep('review');
    }
  };

  const handleChangeMethod = () => {
    setStep('select');
  };

  const finalPrice = price - discount;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-background via-background to-accent/5">
        <DialogHeader className="border-b-2 border-accent/20 pb-4">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
            {step === 'select' ? 'Choose Your Payment Method' : step === 'review' ? 'Review Your Order' : 'Processing Payment'}
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            {step === 'select' 
              ? `Select how you'd like to pay for ${courseTitle}`
              : step === 'review'
              ? 'Please review your order details before proceeding'
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
                  <>
                    Review Order
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
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
        ) : step === 'review' ? (
          <div className="space-y-6 pt-4">
            {/* Selected Payment Method Summary */}
            <div className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border-2 border-accent/20">
              <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-accent" />
                Selected Payment Method
              </h3>
              {(() => {
                const method = paymentMethods.find(m => m.id === selectedMethod);
                if (!method) return null;
                return (
                  <div className="flex items-start gap-4 p-4 bg-card rounded-lg border border-accent/30">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-gold flex items-center justify-center flex-shrink-0">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-base text-foreground">{method.name}</h4>
                      <p className="text-sm text-muted-foreground">{method.tagline}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleChangeMethod}
                      className="border-2 border-accent/30 hover:border-accent font-semibold"
                    >
                      Change
                    </Button>
                  </div>
                );
              })()}
            </div>

            {/* Order Summary */}
            <div className="p-6 bg-gradient-to-br from-muted/30 to-secondary/20 rounded-xl border-2 border-accent/20">
              <h3 className="font-bold text-lg text-foreground mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Course:</span>
                  <span className="text-sm font-bold text-foreground">{courseTitle}</span>
                </div>
                {discount > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Original Price:</span>
                      <span className="text-sm line-through text-muted-foreground">£{price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Discount:</span>
                      <span className="text-sm font-bold text-success">-£{discount.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-center pt-3 border-t-2 border-accent/30">
                  <span className="font-bold text-lg">Total Amount:</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-accent to-gold bg-clip-text text-transparent">
                    £{finalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Legal Agreements Confirmation */}
            <div className="p-6 bg-gradient-to-br from-success/5 to-success/10 rounded-xl border-2 border-success/20">
              <h3 className="font-bold text-base text-foreground mb-3 flex items-center gap-2">
                <Check className="w-5 h-5 text-success" />
                Legal Agreements Confirmed
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Terms & Conditions accepted
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Privacy Policy accepted
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Refund Policy understood
                </li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isProcessing}
                className="flex-1 h-12 font-semibold border-2 hover:bg-muted"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="flex-1 h-12 font-bold text-base bg-gradient-to-r from-accent to-gold hover:from-accent/90 hover:to-gold/90 text-primary shadow-lg hover:shadow-xl transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm & Pay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
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