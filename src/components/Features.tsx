import { Target, Users, BarChart3, Zap, Shield, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Target,
    title: "Precision Targeting",
    description: "Reach the right candidates with AI-powered targeting and smart job distribution across 100+ platforms."
  },
  {
    icon: Users,
    title: "Candidate Engagement",
    description: "Build relationships with automated nurture campaigns and personalized communication at scale."
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track performance metrics in real-time with comprehensive analytics and actionable insights."
  },
  {
    icon: Zap,
    title: "Instant Integration",
    description: "Connect with your existing ATS, CRM, and HRIS systems in minutes, not weeks."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level encryption and compliance with GDPR, SOC 2, and ISO standards."
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Post jobs in 50+ languages and reach candidates across 150+ countries effortlessly."
  }
];

export const Features = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-tc-amber/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tc-gold/5 rounded-full blur-[120px]" />
      </div>
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Everything You Need to Win
          </h2>
          <p className="text-xl text-muted-foreground">
            Powerful features designed to supercharge your recruitment marketing
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="hover-lift border border-border/50 shadow-md hover:shadow-xl hover:border-tc-amber/30 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="pt-8 pb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tc-amber/10 to-tc-gold/5 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-tc-navy" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
