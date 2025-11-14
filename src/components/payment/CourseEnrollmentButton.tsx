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

  const handlePaymentMethodSelected = async (method: string) => {
    // Pre-open a blank window for external checkouts to avoid popup blockers in iframe
    const needsNewWindow = method === 'stripe' || method === 'paypal' || method === 'payl8r';
    const inIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();
    const targetWindow = needsNewWindow && inIframe ? window.open('', '_blank', 'noopener,noreferrer') : null;

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const customerEmail = user?.email || '';
      const customerName = user?.user_metadata?.full_name || '';

      // Route to appropriate payment handler
      switch (method) {
        case 'stripe':
          await handleStripeCheckout(customerEmail, customerName, targetWindow || undefined);
          break;
        case 'paypal':
          await handlePayPalCheckout(customerEmail, customerName, targetWindow || undefined);
          break;
        case 'bank_transfer':
          await handleBankTransfer(customerEmail, customerName);
          break;
        case 'payl8r':
          await handlePayl8r(customerEmail, customerName, targetWindow || undefined);
          break;
        default:
          throw new Error('Invalid payment method');
      }
    } catch (error) {
      // Close any pre-opened blank tab on error
      try { if (targetWindow && !targetWindow.closed) targetWindow.close(); } catch {}
      console.error('Payment error:', error);
      toast({
        variant: 'destructive',
        title: 'Payment Error',
        description: error instanceof Error ? error.message : 'Failed to process payment'
      });
      setIsProcessing(false);
    }
  };

  const handleStripeCheckout = async (email: string, name: string, targetWindow?: Window | null) => {
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

    const inIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();

    if (targetWindow && !targetWindow.closed) {
      targetWindow.location.href = data.url;
    } else if (inIframe) {
      const win = window.open(data.url, '_blank', 'noopener,noreferrer');
      if (!win) {
        toast({ title: 'Popup blocked', description: 'Please allow popups to continue.' });
        // Fallback to navigating inside the iframe
        window.location.assign(data.url);
      }
    } else {
      window.location.assign(data.url);
    }
  };

  const handlePayPalCheckout = async (email: string, name: string, targetWindow?: Window | null) => {
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

    const inIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();

    if (targetWindow && !targetWindow.closed) {
      targetWindow.location.href = data.approvalUrl;
    } else if (inIframe) {
      const win = window.open(data.approvalUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        toast({ title: 'Popup blocked', description: 'Please allow popups to continue.' });
        window.location.assign(data.approvalUrl);
      }
    } else {
      window.location.assign(data.approvalUrl);
    }
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

  const handlePayl8r = async (email: string, name: string, targetWindow?: Window | null) => {
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

    const inIframe = (() => {
      try { return window.self !== window.top; } catch { return true; }
    })();

    if (targetWindow && !targetWindow.closed) {
      targetWindow.location.href = data.applicationUrl;
    } else if (inIframe) {
      const win = window.open(data.applicationUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        toast({ title: 'Popup blocked', description: 'Please allow popups to continue.' });
        window.location.assign(data.applicationUrl);
      }
    } else {
      window.location.assign(data.applicationUrl);
    }
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