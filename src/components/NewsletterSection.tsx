import { NewsletterSignup } from "./NewsletterSignup";
import { Mail, TrendingUp, Calendar, CheckCircle } from "lucide-react";

export const NewsletterSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-tc-navy via-tc-blue to-tc-navy text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      <div className="container max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-tc-amber/20 text-tc-amber px-4 py-2 rounded-full border border-tc-amber/30">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-bold">FREE WEEKLY INSIGHTS</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Get Career Tips Delivered to Your{" "}
              <span className="text-tc-amber">Inbox & WhatsApp</span>
            </h2>

            <p className="text-xl text-white/80 leading-relaxed">
              Join 1,000+ career switchers receiving weekly strategies, job alerts, 
              and insider tips that actually work.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-tc-amber/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-tc-amber" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Weekly Career Insights</h3>
                  <p className="text-white/70">
                    Practical tips on job hunting, interviews, and salary negotiation
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-tc-amber/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <TrendingUp className="w-4 h-4 text-tc-amber" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Exclusive Job Alerts</h3>
                  <p className="text-white/70">
                    Be first to know about high-paying opportunities in your field
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-tc-amber/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Calendar className="w-4 h-4 text-tc-amber" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Early Course Access</h3>
                  <p className="text-white/70">
                    Get notified before cohorts fill up + exclusive discounts
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-white/60 italic pt-4">
              "The weekly tips alone have been worth it. I landed my AML role 
              using advice from the newsletter!" - Sarah K., AML Analyst
            </p>
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
