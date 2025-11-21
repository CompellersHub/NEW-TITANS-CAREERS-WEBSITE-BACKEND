import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, DollarSign, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaymentMethodOption {
  id: 'stripe' | 'paypal' | 'bank_transfer' | 'payl8r';
  name: string;
  tagline: string;
  badge?: 'popular' | 'flexible' | 'secure' | 'traditional';
  benefits: string[];
  processingTime: string;
  icon: React.ReactNode;
  disclaimer?: string;
  monthlyFrom?: string;
}

interface PaymentMethodCardProps {
  method: PaymentMethodOption;
  selected: boolean;
  onSelect: () => void;
  price?: number;
}

const badgeColors = {
  popular: 'bg-primary text-primary-foreground',
  flexible: 'bg-secondary text-secondary-foreground',
  secure: 'bg-accent text-accent-foreground',
  traditional: 'bg-muted text-muted-foreground'
};

export function PaymentMethodCard({ method, selected, onSelect, price }: PaymentMethodCardProps) {
  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all duration-300 p-6 border-2 overflow-hidden",
        "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1",
        selected 
          ? "border-accent shadow-accent bg-gradient-to-br from-primary/5 to-accent/5" 
          : "border-border hover:border-accent/50 bg-card",
        "group"
      )}
      onClick={onSelect}
    >
      {/* Accent bar on selected */}
      {selected && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-gold to-accent" />
      )}

      {/* Selection Check */}
      {selected && (
        <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-accent to-gold rounded-full flex items-center justify-center shadow-md">
          <Check className="w-5 h-5 text-primary font-bold" />
        </div>
      )}

      {/* Badge */}
      {method.badge && (
        <Badge className={cn(
          "mb-3 uppercase text-xs font-semibold tracking-wide",
          method.badge === 'popular' && "bg-gradient-to-r from-accent to-gold text-primary border-0",
          method.badge === 'secure' && "bg-gradient-to-r from-accent to-gold text-primary border-0",
          method.badge === 'flexible' && "bg-primary text-primary-foreground",
          method.badge === 'traditional' && "bg-muted text-muted-foreground"
        )}>
          {method.badge.charAt(0).toUpperCase() + method.badge.slice(1)}
        </Badge>
      )}

      {/* Icon and Title */}
      <div className="flex items-start gap-4 mb-4">
        <div className={cn(
          "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md",
          selected 
            ? "bg-gradient-to-br from-accent to-gold text-primary scale-110" 
            : "bg-gradient-to-br from-muted to-secondary text-muted-foreground group-hover:from-accent/20 group-hover:to-gold/20"
        )}>
          {method.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-xl mb-1 text-foreground">{method.name}</h3>
          <p className="text-sm text-muted-foreground font-medium">{method.tagline}</p>
        </div>
      </div>

      {/* Removed monthly payment preview as per requirements */}

      {/* Benefits */}
      <ul className="space-y-2.5 mb-4">
        {method.benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-3 text-sm">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-primary font-bold" />
            </div>
            <span className="text-foreground font-medium">{benefit}</span>
          </li>
        ))}
      </ul>

      {/* Processing Time */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-accent to-gold" />
        <p className="text-muted-foreground">
          <span className="font-semibold text-foreground">Processing:</span> {method.processingTime}
        </p>
      </div>

      {/* Disclaimer (for Payl8r) */}
      {method.disclaimer && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            {method.disclaimer}
          </p>
        </div>
      )}
    </Card>
  );
}

// Predefined payment methods
export const paymentMethods: PaymentMethodOption[] = [
  {
    id: 'stripe',
    name: 'Pay with Card',
    tagline: 'Credit or Debit Card',
    badge: 'popular',
    icon: <CreditCard className="w-6 h-6" />,
    benefits: [
      'Instant course access',
      'Secure payment processing',
      'All major cards accepted'
    ],
    processingTime: 'Instant'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    tagline: 'Pay with PayPal balance or card',
    badge: 'secure',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 00-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 01-.794.679H7.72a.483.483 0 01-.477-.558L8.926 12.5l.076-.485a.805.805 0 01.794-.68h1.647c3.238 0 5.774-1.313 6.514-5.12.061-.316.106-.624.134-.922.384.194.72.43 1.009.717.363.362.647.78.867 1.248z"/>
        <path d="M18.865 5.292c-.248-.094-.51-.172-.783-.232a6.78 6.78 0 00-1.294-.113H9.79a.805.805 0 00-.794.68l-1.673 10.6a.483.483 0 00.477.557h3.355l.842-5.344-.026.167a.805.805 0 01.793-.68h1.647c3.238 0 5.774-1.314 6.514-5.12.061-.316.106-.624.134-.922a4.94 4.94 0 00-.731-.38 5.483 5.483 0 00-.463-.213z"/>
      </svg>
    ),
    benefits: [
      'Pay with PayPal balance',
      'Buyer protection included',
      'No card details shared'
    ],
    processingTime: 'Instant'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    tagline: 'Direct bank payment',
    badge: 'traditional',
    icon: <Building2 className="w-6 h-6" />,
    benefits: [
      'No payment fees',
      'Direct from your bank',
      'UK bank accounts'
    ],
    processingTime: '1-2 business days'
  }
  // Payl8r temporarily disabled - requires API credentials setup
  // Uncomment and configure edge function when ready
];