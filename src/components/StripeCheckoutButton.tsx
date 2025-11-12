import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      // This will be implemented once Lovable Cloud is enabled
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ courseSlug, courseTitle, price })
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

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCheckout}
      disabled={isLoading}
    >
      {showIcon && <ShoppingCart className="h-4 w-4 mr-2" />}
      {isLoading ? 'Loading...' : `Enroll Now - £${price}`}
    </Button>
  );
}
