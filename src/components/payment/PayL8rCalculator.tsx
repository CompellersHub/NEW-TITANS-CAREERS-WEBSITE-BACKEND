import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Payl8rDisclaimer } from './Payl8rDisclaimer';

interface PayL8rCalculatorProps {
  coursePrice: number;
  onApply?: () => void;
}

export function PayL8rCalculator({ coursePrice, onApply }: PayL8rCalculatorProps) {
  const [deposit, setDeposit] = useState(0);
  const [term, setTerm] = useState(12);

  const financeAmount = coursePrice - deposit;
  const monthlyPayment = (financeAmount / term).toFixed(2);
  const totalToPay = coursePrice; // 0% APR

  const terms = [
    { months: 3, label: '3 months' },
    { months: 6, label: '6 months' },
    { months: 9, label: '9 months' },
    { months: 12, label: '12 months' }
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-background to-secondary/10">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">Payl8r Calculator</h3>
            <p className="text-sm text-muted-foreground">
              Spread the cost over 3-12 months with 0% APR
            </p>
          </div>
          <Badge variant="secondary" className="bg-green-600 text-white">
            0% APR
          </Badge>
        </div>

        {/* Deposit Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Deposit (optional)</Label>
            <span className="text-sm font-semibold">£{deposit}</span>
          </div>
          <Slider
            value={[deposit]}
            onValueChange={(values) => setDeposit(values[0])}
            max={100}
            step={10}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Reduce your monthly payment by paying a deposit
          </p>
        </div>

        {/* Term Selection */}
        <div className="space-y-3">
          <Label>Repayment Term</Label>
          <div className="grid grid-cols-2 gap-2">
            {terms.map((t) => (
              <Button
                key={t.months}
                variant={term === t.months ? 'default' : 'outline'}
                onClick={() => setTerm(t.months)}
                className="w-full"
              >
                {t.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-primary/10 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Course Price:</span>
            <span className="font-medium">£{coursePrice.toFixed(2)}</span>
          </div>
          {deposit > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deposit:</span>
              <span className="font-medium">-£{deposit.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount to Spread:</span>
            <span className="font-medium">£{financeAmount.toFixed(2)}</span>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between items-baseline">
              <span className="text-sm font-medium">Monthly Payment:</span>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">£{monthlyPayment}</div>
                <div className="text-xs text-muted-foreground">for {term} months</div>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-sm pt-2">
            <span className="text-muted-foreground">Total to Pay:</span>
            <span className="font-semibold">£{totalToPay.toFixed(2)}</span>
          </div>
        </div>

        {/* Eligibility Checklist */}
        <div className="space-y-2">
          <Label className="text-xs">Eligibility Requirements:</Label>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              UK resident aged 18+
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              Regular income (employed or self-employed)
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-primary" />
              UK bank account with online banking
            </li>
          </ul>
        </div>

        {/* Apply Button */}
        {onApply && (
          <Button onClick={onApply} size="lg" className="w-full">
            Apply Now - Get decision in 60 seconds
          </Button>
        )}

        {/* Disclaimer */}
        <Payl8rDisclaimer />
      </div>
    </Card>
  );
}