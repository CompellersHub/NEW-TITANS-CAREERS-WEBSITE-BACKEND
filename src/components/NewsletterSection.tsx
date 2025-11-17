import { NewsletterSignup } from "./NewsletterSignup";
import { Badge } from "@/components/ui/badge";
import { Mail, TrendingUp, Calendar } from "lucide-react";

export const NewsletterSection = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-tc-navy/[0.02] relative overflow-hidden">
      <div className="container max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 animate-fade-in">
            <Badge className="bg-tc-navy/10 text-tc-navy border-tc-navy/20 font-semibold px-4 py-2 inline-flex items-center gap-2">
              <Mail className="w-4 h-4" />
              FREE WEEKLY INSIGHTS
            </Badge>

            <h2 className="font-kanit text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-tc-navy">
              Get Career Tips Delivered to Your <span className="text-tc-amber">Inbox</span>
            </h2>

            <p className="font-sans text-lg text-muted-foreground leading-relaxed">
              Weekly guidance on CVs, interviews, compliance and tech roles, plus job alerts and early access to Titans Careers cohorts.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-tc-amber rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-tc-navy font-sans">
                    Weekly career insights
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-tc-amber rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-tc-navy font-sans">
                    Exclusive job alerts
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-tc-amber rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-tc-navy font-sans">
                    Early course access
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Newsletter Form */}
          <div className="lg:pl-8">
            <NewsletterSignup 
              variant="card" 
              source="homepage-section" 
              showWhatsApp={true}
              showName={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
