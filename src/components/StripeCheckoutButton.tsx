import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Tag, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface StripeCheckoutButtonProps {
  courseSlug: string;
  courseTitle: string;
  price: number;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
  showIcon?: boolean;
}

export function StripeCheckoutButton({ 
  courseSlug, 
  courseTitle, 
  price, 
  variant = "default",
  size = "default",
  className = "",
  showIcon = true
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showVoucherInput, setShowVoucherInput] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discountAmount: number;
    finalPrice: number;
  } | null>(null);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error('Please enter a voucher code');
      return;
    }

    setIsValidating(true);
    try {
      const response = await supabase.functions.invoke('validate-voucher', {
        body: {
          voucherCode: voucherCode.trim(),
          courseSlug,
          price,
          userEmail: null
        }
      });

      if (response.error) throw response.error;

      const { valid, discountAmount, finalPrice, error } = response.data;

      if (valid) {
        setAppliedVoucher({
          code: voucherCode.trim().toUpperCase(),
          discountAmount,
          finalPrice
        });
        toast.success(`Voucher applied! You save £${discountAmount.toFixed(2)}`);
        setShowVoucherInput(false);
      } else {
        toast.error(error || 'Invalid voucher code');
      }
    } catch (error) {
      console.error('Voucher validation error:', error);
      toast.error('Failed to validate voucher');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setShowVoucherInput(false);
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          courseSlug, 
          courseTitle, 
          price,
          voucherCode: appliedVoucher?.code,
          userEmail: null
        })
      });

      const data = await response.json();
      
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      toast.error('Failed to start checkout. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayPrice = appliedVoucher ? appliedVoucher.finalPrice : price;

  return (
    <div className="w-full space-y-3">
      {appliedVoucher ? (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                {appliedVoucher.code} applied
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveVoucher}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Original Price:</span>
              <span className="line-through text-muted-foreground">£{price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Discount:</span>
              <span className="text-green-600 font-medium">-£{appliedVoucher.discountAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ) : showVoucherInput ? (
        <div className="p-3 border rounded-lg space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter voucher code"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyVoucher()}
              className="flex-1"
            />
            <Button
              variant="secondary"
              onClick={handleApplyVoucher}
              disabled={isValidating}
            >
              {isValidating ? 'Validating...' : 'Apply'}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowVoucherInput(false)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowVoucherInput(true)}
          className="w-full"
        >
          <Tag className="h-4 w-4 mr-2" />
          Have a voucher code?
        </Button>
      )}

      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleCheckout}
        disabled={isLoading}
      >
        {showIcon && <ShoppingCart className="h-4 w-4 mr-2" />}
        {isLoading ? 'Loading...' : `Enroll Now - £${displayPrice}`}
      </Button>
    </div>
  );
}
