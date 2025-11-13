import { Card, CardContent } from "@/components/ui/card";

interface ProcessStepProps {
  step: number;
  title: string;
  description: string;
}

export function ProcessStep({ step, title, description }: ProcessStepProps) {
  return (
    <Card className="border-2 hover:border-accent/50 transition-all duration-300 hover:shadow-lg group bg-card">
      <CardContent className="p-8 text-center space-y-4">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-gold flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-300">
            <span className="font-kanit text-3xl font-bold text-accent-foreground">{step}</span>
          </div>
          <div className="absolute inset-0 rounded-full bg-accent/20 blur-xl animate-pulse"></div>
        </div>
        
        <h3 className="font-kanit text-2xl font-bold text-primary group-hover:text-accent transition-colors">
          {title}
        </h3>
        
        <p className="font-sans text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
