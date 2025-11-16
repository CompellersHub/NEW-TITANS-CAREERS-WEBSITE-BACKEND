import { NewsletterSignup } from "./NewsletterSignup";
import { Mail, TrendingUp, Calendar } from "lucide-react";

export const NewsletterSection = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="container max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white border border-tc-navy px-4 py-2 rounded-full">
              <Mail className="w-4 h-4 text-tc-navy" />
              <span className="text-sm font-bold text-tc-navy">FREE WEEKLY INSIGHTS</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight text-tc-navy">
              Get Career Tips Delivered to Your Inbox & WhatsApp
            </h2>

            <p className="text-lg text-tc-mid-grey leading-relaxed">
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
