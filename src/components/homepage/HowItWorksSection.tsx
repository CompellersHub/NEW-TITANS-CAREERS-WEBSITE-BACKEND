import { CheckCircle2, Users, Briefcase, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Users,
    title: "Join a Free Q&A Session",
    description: "Connect with our team and ask anything about our courses, career paths, and what to expect.",
  },
  {
    icon: CheckCircle2,
    title: "Enrol in a Practical Cohort",
    description: "Choose your course and join a live cohort with expert instructors and peer support.",
  },
  {
    icon: Briefcase,
    title: "Build Projects & Portfolio",
    description: "Work on real-world projects that you can showcase to employers in your field.",
  },
  {
    icon: TrendingUp,
    title: "Get Ongoing Career Support",
    description: "Access career guidance, CV reviews, and job application support even after you complete.",
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-tc-navy/[0.02]">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 md:mb-20 space-y-6 animate-fade-in">
          <h2 className="font-kanit text-3xl md:text-4xl lg:text-6xl font-bold text-tc-navy">
            Your Journey to <span className="text-tc-amber">Success</span>
          </h2>
          <p className="font-sans text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Four simple steps to transform your career with practical training
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="relative group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="bg-card rounded-2xl p-8 border border-border/50 shadow-lg hover:shadow-2xl hover:border-tc-amber/30 transition-all duration-400 h-full">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-to-br from-tc-amber to-tc-gold rounded-full flex items-center justify-center text-white font-kanit font-bold text-lg shadow-amber-glow">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className="w-16 h-16 bg-tc-amber/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-amber-glow transition-all duration-400">
                  <step.icon className="w-8 h-8 text-tc-amber" />
                </div>
                
                {/* Content */}
                <h3 className="font-kanit text-xl font-bold mb-3 text-tc-navy group-hover:text-tc-amber transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Connector Line (desktop only) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-accent to-gold" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
