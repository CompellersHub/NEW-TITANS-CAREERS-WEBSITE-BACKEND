import { PageLayout } from "@/components/layouts/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MessageCircle, MapPin, Clock, CheckCircle2, Sparkles, ArrowRight, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContactMethodCard } from "@/components/contact/ContactMethodCard";
import { ProcessStep } from "@/components/contact/ProcessStep";
import { InteractiveMap } from "@/components/contact/InteractiveMap";
import { ContactChatbot } from "@/components/contact/ContactChatbot";
import { MobileContactBar } from "@/components/contact/MobileContactBar";
import { PullToRefreshIndicator } from "@/components/contact/PullToRefreshIndicator";
import { FeedbackWidget } from "@/components/contact/FeedbackWidget";
import { SocialProofNotifications } from "@/components/marketing/SocialProofNotifications";
import { ContactPageSkeleton } from "@/components/contact/ContactPageSkeleton";
import { CareerConsultationForm } from "@/components/contact/CareerConsultationForm";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";


const Contact = () => {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  // Pull-to-refresh functionality
  const handleRefresh = async () => {
    // Simulate content refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Trigger a re-render to show fresh content
    setRefreshKey(prev => prev + 1);
    
    toast({
      title: "Page Refreshed",
      description: "Contact information updated successfully",
    });
  };

  const { pullDistance, isRefreshing, isAtThreshold } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
  });

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      value: "info@titanscareers.com",
      description: "Send your questions to our support team",
      action: "Send Email",
      link: "mailto:info@titanscareers.com",
      iconColor: "text-accent"
    },
    {
      icon: Phone,
      title: "Call Us",
      value: "+44 20 4572 0475",
      description: "Speak directly with our career advisors",
      action: "Call Now",
      link: "tel:+442045720475",
      iconColor: "text-accent"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      value: "+44 7539 434403",
      description: "Message us anytime for quick support",
      action: "Start Chat",
      link: "https://wa.me/447539434403",
      iconColor: "text-accent"
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Initial Contact",
      description: "Initial Introduction"
    },
    {
      step: 2,
      title: "Consultation",
      description: "Personalized discussion about your needs"
    },
    {
      step: 3,
      title: "Customized Plan",
      description: "Tailored strategies for your goals"
    },
    {
      step: 4,
      title: "Ongoing Support",
      description: "Continuous guidance on your journey"
    }
  ];

  if (isLoading) {
    return <ContactPageSkeleton />;
  }

  return (
    <PageLayout intensity3D="medium" show3D={true}>
      <div className="pb-20 md:pb-0" key={refreshKey}>
        <SEO 
          title="Contact Us - Get in Touch with Titans Training Group"
          description="Have questions about our training courses? Contact Titans Training Group via email, phone, or WhatsApp. We're here to help you start your career transformation journey."
          keywords="contact titans training, training enquiries, course questions, career advice contact, training support"
        />
      
      {/* Pull-to-Refresh Indicator */}
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        isAtThreshold={isAtThreshold}
        threshold={80}
      />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-tc-navy to-tc-navy/95 text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-tc-amber/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-tc-gold/8 rounded-full blur-[140px]" />
        
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <Badge className="bg-tc-amber/20 text-tc-amber border-tc-amber/30 backdrop-blur-sm px-6 py-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              GET IN TOUCH
            </Badge>
            
            <h1 className="font-kanit text-4xl md:text-5xl lg:text-7xl font-bold leading-tight text-white">
              Let's Transform <br />
              <span className="text-tc-amber">Your Career Together</span>
            </h1>
            
            <p className="font-sans text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto">
              Have questions about our courses? Ready to discuss your career goals? 
              Our expert team is here to guide you every step of the way.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <CheckCircle2 className="w-5 h-5 text-tc-amber" />
                24-Hour Response
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/30"></div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <CheckCircle2 className="w-5 h-5 text-tc-amber" />
                Free Consultation
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/30"></div>
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <CheckCircle2 className="w-5 h-5 text-tc-amber" />
                Expert Guidance
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20 space-y-6 animate-fade-in">
            <Badge className="bg-tc-navy/10 text-tc-navy border-tc-navy/20 font-semibold">
              <MessageCircle className="w-3 h-3 mr-2" />
              REACH OUT ANYTIME
            </Badge>
            <h2 className="font-kanit text-3xl md:text-4xl lg:text-6xl font-bold text-tc-navy">
              Multiple Ways to <span className="text-tc-amber">Connect</span>
            </h2>
            <p className="font-sans text-xl text-muted-foreground max-w-3xl mx-auto">
              Choose your preferred communication method and get instant access to our expert team
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {contactMethods.map((method, index) => (
              <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <ContactMethodCard {...method} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 bg-background">
        <div className="container max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <CareerConsultationForm />

            {/* Office Info & Hours */}
            <div className="space-y-6">
              <Card className="border-2">
                <CardHeader className="bg-primary text-primary-foreground rounded-t-xl">
                  <CardTitle className="font-kanit flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-accent" />
                    Office Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-kanit font-bold text-primary mb-2">Titans Careers UK</h3>
                    <p className="font-sans text-muted-foreground leading-relaxed">
                      London, United Kingdom<br />
                      (Remote-first training with UK support)
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-accent mt-1" />
                      <div>
                        <h4 className="font-kanit font-bold text-primary mb-2">Operating Hours</h4>
                        <div className="space-y-1 font-sans text-muted-foreground">
                          <p><span className="font-semibold">Monday - Friday:</span> 9:00 AM - 6:00 PM GMT</p>
                          <p><span className="font-semibold">Saturday:</span> 10:00 AM - 4:00 PM GMT</p>
                          <p><span className="font-semibold">Sunday:</span> Closed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-primary to-primary/90 text-primary-foreground border-2 border-accent/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-kanit text-2xl font-bold">
                      Prefer Instant Chat?
                    </h3>
                  </div>
                  
                  <p className="font-sans text-primary-foreground/90 leading-relaxed text-lg">
                    WhatsApp is our <span className="font-bold text-accent">fastest way to connect</span>. 
                    Send us a message and get a response within minutes during business hours.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      <span>Average response time: <span className="font-bold text-primary-foreground">5 minutes</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                      <CheckCircle2 className="w-4 h-4 text-accent" />
                      <span>Available Monday-Saturday</span>
                    </div>
                  </div>
                  
                  <a 
                    href="https://wa.me/447539434403" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button 
                      size="lg" 
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg py-6 transition-all hover:scale-105 group"
                    >
                      <MessageCircle className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                      Start WhatsApp Chat
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-gold/10 border-2 border-accent/30">
                <CardContent className="p-6 space-y-3">
                  <h4 className="font-kanit font-bold text-primary text-lg">Quick Response Guarantee</h4>
                  <ul className="space-y-2 font-sans text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span>WhatsApp messages: Within 1 hour (business hours)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span>Email enquiries: Within 24 hours</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-accent font-bold">✓</span>
                      <span>Phone calls: Answered during operating hours</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Office Location with Map */}
      <section className="py-24 bg-gradient-to-b from-secondary/30 to-background">
        <div className="container max-w-7xl">
          <div className="text-center mb-20 space-y-6 animate-fade-in">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <MapPin className="w-3 h-3 mr-2" />
              VISIT US
            </Badge>
            <h2 className="font-kanit text-4xl md:text-6xl font-bold text-primary">
              Visit Our <span className="text-accent">London Office</span>
            </h2>
            <p className="font-sans text-xl text-muted-foreground max-w-2xl mx-auto">
              Located in the heart of Mayfair, we're easily accessible and ready to welcome you
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Office Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-2">
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-kanit text-xl font-bold text-primary mb-2">Address</h3>
                        <p className="font-sans text-muted-foreground leading-relaxed">
                          3rd Floor<br />
                          45 Albemarle Street<br />
                          Mayfair, London<br />
                          W1S 4JL
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-kanit text-xl font-bold text-primary mb-2">Office Hours</h3>
                        <div className="space-y-1 font-sans text-muted-foreground">
                          <p><span className="font-semibold text-foreground">Monday - Friday:</span> 9:00 AM - 5:00 PM</p>
                          <p><span className="font-semibold text-foreground">Weekends:</span> By appointment</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <Navigation className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-kanit text-xl font-bold text-primary mb-2">Nearby Transport</h3>
                        <div className="space-y-2 font-sans text-muted-foreground">
                          <p><span className="font-semibold text-foreground">Green Park Station</span> - 5 min walk</p>
                          <p className="text-sm">Bus Routes: 8, 9, 14, 19, 22, 38</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interactive Map */}
            <div className="lg:col-span-3 h-[600px]">
              <ErrorBoundary fallback={<div className="w-full h-full min-h-[400px] bg-muted rounded-lg flex items-center justify-center">Map is currently unavailable.</div>}>
                <InteractiveMap 
                  latitude={51.5099}
                  longitude={-0.1415}
                  address="45 Albemarle Street, Mayfair, London W1S 4JL"
                />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect Process */}
      <section className="py-24 bg-gradient-to-b from-background to-secondary/20">
        <div className="container max-w-7xl">
          <div className="text-center mb-20 space-y-6 animate-fade-in">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Clock className="w-3 h-3 mr-2" />
              OUR PROCESS
            </Badge>
            <h2 className="font-kanit text-4xl md:text-6xl font-bold text-primary">
              What Happens <span className="text-accent">After You Reach Out</span>
            </h2>
            <p className="font-sans text-xl text-muted-foreground max-w-3xl mx-auto">
              We've designed a simple, effective process to ensure you get the guidance and support you deserve
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connection line for desktop */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-accent/0 via-accent/50 to-accent/0"></div>
            
            {processSteps.map((step, index) => (
              <div key={index} className="animate-fade-in relative z-10" style={{ animationDelay: `${index * 150}ms` }}>
                <ProcessStep {...step} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-24 bg-gradient-to-br from-secondary/30 to-background">
        <div className="container max-w-5xl">
          <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-12 text-center space-y-8">
              <div className="space-y-4">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Sparkles className="w-3 h-3 mr-2" />
                  QUICK ANSWERS
                </Badge>
                <h2 className="font-kanit text-3xl md:text-5xl font-bold text-primary">
                  Need Answers <span className="text-accent">Right Now?</span>
                </h2>
                <p className="font-sans text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Browse our comprehensive FAQ section for instant answers to the most common questions about our courses, pricing, and career support.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a href="/#faqs">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 text-lg transition-all hover:scale-105 group"
                  >
                    Browse FAQs
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <p className="text-sm text-muted-foreground">or contact us directly below</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <ContactChatbot />
      <MobileContactBar />
      <FeedbackWidget />
      <SocialProofNotifications />
      </div>
    </PageLayout>
  );
};

export default Contact;
