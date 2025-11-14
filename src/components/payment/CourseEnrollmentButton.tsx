import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaymentFlowDialog } from './PaymentFlowDialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface CourseEnrollmentButtonProps {
  courseSlug: string;
  courseTitle: string;
  price: number;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  voucherCode?: string;
  voucherDiscount?: number;
}

export function CourseEnrollmentButton({
  courseSlug,
  courseTitle,
  price,
  variant = 'default',
  size = 'default',
  className,
  voucherCode,
  voucherDiscount = 0
}: CourseEnrollmentButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const finalPrice = price - voucherDiscount;

  // Open external checkout in a new tab to avoid iframe restrictions or X-Frame-Options issues
  const openExternal = (url: string) => {
    try {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        // Fallback: same-tab navigation
        window.location.assign(url);
      }
    } catch (e) {
      window.location.assign(url);
    }
  };

  const handlePaymentMethodSelected = async (method: string) => {
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const customerEmail = user?.email || '';
      const customerName = user?.user_metadata?.full_name || '';

      // Route to appropriate payment handler
      switch (method) {
        case 'stripe':
          await handleStripeCheckout(customerEmail, customerName);
          break;
        case 'paypal':
          await handlePayPalCheckout(customerEmail, customerName);
          break;
        case 'bank_transfer':
          await handleBankTransfer(customerEmail, customerName);
          break;
        case 'payl8r':
          await handlePayl8r(customerEmail, customerName);
          break;
        default:
          throw new Error('Invalid payment method');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to process payment'
      });
      setIsProcessing(false);
    }
  };

  const handleStripeCheckout = async (email: string, name: string) => {
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        courseSlug,
        courseTitle,
        price: finalPrice,
        voucherCode,
        email,
        name
      }
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No checkout URL received');

    // Direct navigation to Stripe checkout
    openExternal(data.url);
  };

  const handlePayPalCheckout = async (email: string, name: string) => {
    const { data, error } = await supabase.functions.invoke('create-paypal-order', {
      body: {
        courseSlug,
        courseTitle,
        price: finalPrice,
        voucherCode,
        email,
        name
      }
    });

    if (error) throw error;
    if (!data?.approvalUrl) throw new Error('No PayPal approval URL received');

    // Direct navigation to PayPal
    openExternal(data.approvalUrl);
  };

  const handleBankTransfer = async (email: string, name: string) => {
    const { data, error } = await supabase.functions.invoke('create-bank-transfer', {
      body: {
        courseSlug,
        courseTitle,
        price: finalPrice,
        voucherCode,
        email,
        name
      }
    });

    if (error) throw error;

    setDialogOpen(false);
    setIsProcessing(false);

    toast({
      title: 'Bank Transfer Instructions Sent',
      description: `We've sent payment instructions to ${email}. Reference: ${data.reference}`
    });

    // Redirect to payment status page
    window.location.href = `/payment-status?ref=${data.reference}`;
  };

  const handlePayl8r = async (email: string, name: string) => {
    const { data, error } = await supabase.functions.invoke('create-payl8r-application', {
      body: {
        courseSlug,
        courseTitle,
        price: finalPrice,
        voucherCode,
        email,
        name
      }
    });

    if (error) throw error;
    if (!data?.applicationUrl) throw new Error('No Payl8r application URL received');

    // Direct navigation to Payl8r
    openExternal(data.applicationUrl);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setDialogOpen(true)}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Enroll Now
            {voucherDiscount > 0 && (
              <span className="ml-2">
                - £{finalPrice.toFixed(2)}
              </span>
            )}
          </>
        )}
      </Button>

      <PaymentFlowDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        courseTitle={courseTitle}
        courseSlug={courseSlug}
        price={price}
        discount={voucherDiscount}
        voucherCode={voucherCode}
        onPaymentMethodSelected={handlePaymentMethodSelected}
        isProcessing={isProcessing}
      />
    </>
  );
}