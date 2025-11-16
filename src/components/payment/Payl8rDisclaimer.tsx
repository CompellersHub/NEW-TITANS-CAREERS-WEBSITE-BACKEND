import { AlertCircle } from 'lucide-react';

export function Payl8rDisclaimer() {
  return (
    <div className="flex gap-2 p-3 bg-amber-500/10 rounded-lg">
      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        TITANS CAREERS LIMITED is an Introducer Appointed Representative of Social Money Limited t/a Payl8r who is authorised by the FCA under Ref. Number 675283. Credit is subject to creditworthiness and affordability assessments. Missed payments may affect your credit file, future borrowing and incur fees. Representative APR 65.5%
      </p>
    </div>
  );
}
