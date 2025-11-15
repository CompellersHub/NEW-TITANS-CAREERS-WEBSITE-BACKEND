import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, CreditCard, Calendar } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WhatsAppCaptureForm } from "@/components/marketing/WhatsAppCaptureForm";

const pricingPlans = [
  {
    name: "Standard Payment",
    price: "From £997",
    description: "Pay upfront and save",
    features: [
      "Full course access",
      "Live instructor sessions",
      "Hands-on practical projects",
      "CV & LinkedIn overhaul",
      "Interview preparation",
      "Certificate of completion",
      "3 months career support",
    ],
    icon: CreditCard,
    popular: false,
  },
  {
    name: "Flexible Instalments",
    price: "From £99/month",
    description: "FCA-regulated finance partner",
    features: [
      "Everything in Standard",
      "Spread cost over 12 months",
      "No upfront payment required",
      "Quick online approval",
      "Fixed monthly payments",
      "Subject to credit check",
      "0% APR available*",
    ],
    icon: Calendar,
    popular: true,
  },
];

export const PricingSection = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");

  const handlePlanClick = (planName: string) => {
    setSelectedPlan(planName);
    setIsDialogOpen(true);
  };

  return (
    <>
      <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[100px]" />
        </div>

        <div className="container px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-kanit font-bold text-primary mb-4" style={{ fontSize: 'clamp(28px, 4vw, 42px)' }}>
              Flexible Payment Options
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose a payment plan that works for you. Quality training shouldn't be out of reach.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-2 transition-all hover:shadow-xl animate-fade-in ${
                  plan.popular
                    ? "border-accent shadow-[0_8px_32px_-4px_hsl(var(--accent)/0.3)]"
                    : "border-border hover:border-accent/50"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-accent text-primary px-4 py-1 rounded-full text-sm font-bold font-sans">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-10">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <plan.icon className="w-8 h-8 text-accent" />
                  </div>
                  <CardTitle className="text-2xl font-kanit font-bold text-primary mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="text-4xl font-kanit font-bold text-accent mb-2">
                    {plan.price}
                  </div>
                  <p className="text-sm text-muted-foreground font-sans">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground font-sans">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    size="lg"
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handlePlanClick(plan.name)}
                  >
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
            * 0% APR available for selected courses. Finance provided by our FCA-regulated partner. 
            Subject to status. Terms and conditions apply.
          </p>
        </div>
      </section>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-kanit font-bold">
              Start Your Career Transformation
            </DialogTitle>
            <DialogDescription className="text-base">
              Fill out the form below and we'll send you details about {selectedPlan} and add you to our WhatsApp career community for instant support.
            </DialogDescription>
          </DialogHeader>
          <WhatsAppCaptureForm
            onSuccess={() => setIsDialogOpen(false)}
            source={`pricing_${selectedPlan.toLowerCase().replace(/\s+/g, '_')}`}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
