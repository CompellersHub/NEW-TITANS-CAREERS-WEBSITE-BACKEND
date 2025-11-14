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
        "relative cursor-pointer transition-all duration-200 p-6 hover:shadow-lg",
        selected && "ring-2 ring-primary shadow-lg",
        "group"
      )}
      onClick={onSelect}
    >
      {/* Selection Check */}
      {selected && (
        <div className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <Check className="w-4 h-4 text-primary-foreground" />
        </div>
      )}

      {/* Badge */}
      {method.badge && (
        <Badge className={cn("mb-3", badgeColors[method.badge])}>
          {method.badge.charAt(0).toUpperCase() + method.badge.slice(1)}
        </Badge>
      )}

      {/* Icon and Title */}
      <div className="flex items-start gap-4 mb-3">
        <div className={cn(
          "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
          selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          {method.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{method.name}</h3>
          <p className="text-sm text-muted-foreground">{method.tagline}</p>
        </div>
      </div>

      {/* Monthly Payment Preview for Payl8r */}
      {method.monthlyFrom && price && (
        <div className="mb-3 p-3 bg-secondary/20 rounded-lg">
          <p className="text-sm font-medium">
            From <span className="text-lg font-bold text-primary">{method.monthlyFrom}</span>
          </p>
          <p className="text-xs text-muted-foreground">with 0% APR available</p>
        </div>
      )}

      {/* Benefits */}
      <ul className="space-y-2 mb-4">
        {method.benefits.map((benefit, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      {/* Processing Time */}
      <p className="text-xs text-muted-foreground mb-3">
        <span className="font-medium">Processing:</span> {method.processingTime}
      </p>

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
  },
  {
    id: 'payl8r',
    name: 'Payl8r Finance',
    tagline: 'Spread the cost over 3-12 months',
    badge: 'flexible',
    icon: <DollarSign className="w-6 h-6" />,
    benefits: [
      '0% APR available',
      '3, 6, 9, or 12 month terms',
      '60 second approval'
    ],
    processingTime: '~60 seconds approval',
    monthlyFrom: '£41.58/month',
    disclaimer: 'Subject to affordability assessments. Payl8r is an Introducer Appointed Representative of Social Money LTD t/a Payl8r. Missed payments may affect your credit file, future borrowing and incur fees.'
  }
];