import { useState } from 'react';
import { PaymentMethodCard, paymentMethods, PaymentMethodOption } from './PaymentMethodCard';

interface PaymentMethodSelectorProps {
  onSelect: (methodId: string) => void;
  selectedMethod?: string;
  price?: number;
  discount?: number;
}

export function PaymentMethodSelector({ 
  onSelect, 
  selectedMethod,
  price = 499,
  discount = 0 
}: PaymentMethodSelectorProps) {
  const finalPrice = price - discount;
  const monthlyPayment = (finalPrice / 12).toFixed(2);

  // Update Payl8r monthly amount based on actual price
  const methods = paymentMethods.map(method => {
    if (method.id === 'payl8r') {
      return {
        ...method,
        monthlyFrom: `£${monthlyPayment}/month`
      };
    }
    return method;
  });

  return (
    <div className="space-y-6">
      {/* Price Summary */}
      {discount > 0 && (
        <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-6 rounded-xl border-2 border-accent/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-muted-foreground">Original Price:</span>
            <span className="text-sm line-through text-muted-foreground">£{price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-muted-foreground">Discount:</span>
            <span className="text-sm font-bold text-success">-£{discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-3 border-t-2 border-accent/30">
            <span className="font-bold text-lg">Final Price:</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-accent to-gold bg-clip-text text-transparent">£{finalPrice.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Payment Method Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {methods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            selected={selectedMethod === method.id}
            onSelect={() => onSelect(method.id)}
            price={finalPrice}
          />
        ))}
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap gap-6 justify-center items-center pt-6 border-t-2 border-accent/20">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-success to-green-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-foreground">Secure Payment</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-foreground">Instant Access</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
            <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-foreground">SSL Encrypted</span>
        </div>
      </div>
    </div>
  );
}