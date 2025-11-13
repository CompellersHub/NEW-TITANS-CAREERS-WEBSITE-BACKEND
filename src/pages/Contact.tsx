import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MessageCircle, MapPin, Clock, Send, Navigation, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { ContactMethodCard } from "@/components/contact/ContactMethodCard";
import { ProcessStep } from "@/components/contact/ProcessStep";
import { InteractiveMap } from "@/components/contact/InteractiveMap";
import { ContactChatbot } from "@/components/contact/ContactChatbot";
import { MobileContactBar } from "@/components/contact/MobileContactBar";
import { useState, useEffect } from "react";

const contactFormSchema = z.object({
  name: z.string()
    .trim()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Please enter a valid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z.string()
    .trim()
    .min(10, { message: "Please enter a valid phone number" })
    .max(20, { message: "Phone number must be less than 20 characters" })
    .optional()
    .or(z.literal("")),
  subject: z.string()
    .trim()
    .min(3, { message: "Subject must be at least 3 characters" })
    .max(200, { message: "Subject must be less than 200 characters" }),
  message: z.string()
    .trim()
    .min(10, { message: "Message must be at least 10 characters" })
    .max(1000, { message: "Message must be less than 1000 characters" })
});

type ContactFormData = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { toast } = useToast();
  const [charCount, setCharCount] = useState(0);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema)
  });

  const message = watch("message");
  
  useEffect(() => {
    setCharCount(message?.length || 0);
  }, [message]);

  const onSubmit = async (data: ContactFormData) => {
    try {
      // Sanitize and encode data for WhatsApp
      const message = encodeURIComponent(
        `*New Contact Form Submission*\n\n` +
        `*Name:* ${data.name}\n` +
        `*Email:* ${data.email}\n` +
        `*Phone:* ${data.phone || 'Not provided'}\n` +
        `*Subject:* ${data.subject}\n\n` +
        `*Message:*\n${data.message}`
      );
      
      // Open WhatsApp with the message
      window.open(`https://wa.me/447539434403?text=${message}`, '_blank');
      
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });
      
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again or contact us directly.",
        variant: "destructive"
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtMy4zMTQgMi42ODYtNiA2LTZzNi0yLjY4NiA2LTYgMi42ODYtNiA2LTZ2Nmg2djZoLTZ2Nmgtdi02aDE4djZoLTZ2NmgtNnYtNkg0MnYtNmg2di02aDZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container max-w-7xl relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <Badge className="bg-accent/20 text-accent border-accent/30 backdrop-blur-sm px-6 py-2 text-sm font-semibold">
              <Sparkles className="w-4 h-4 mr-2" />
              GET IN TOUCH
            </Badge>
            
            <h1 className="font-kanit text-5xl md:text-7xl font-bold leading-tight">
              Let's Transform <br />
              <span className="text-accent animate-pulse">Your Career Together</span>
            </h1>
            
            <p className="font-sans text-xl md:text-2xl text-primary-foreground/90 leading-relaxed max-w-2xl mx-auto">
              Have questions about our courses? Ready to discuss your career goals? 
              Our expert team is here to guide you every step of the way.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                24-Hour Response
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                Free Consultation
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary-foreground/80">
                <CheckCircle2 className="w-5 h-5 text-accent" />
                Expert Guidance
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Contact Methods */}
      <section className="py-24 bg-background">
        <div className="container max-w-7xl">
          <div className="text-center mb-20 space-y-6 animate-fade-in">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <MessageCircle className="w-3 h-3 mr-2" />
              REACH OUT ANYTIME
            </Badge>
            <h2 className="font-kanit text-4xl md:text-6xl font-bold text-primary">
              Multiple Ways to <span className="text-accent">Connect</span>
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
            <div>
              <div className="mb-8">
                <Badge className="bg-accent/10 text-primary border-accent/30 mb-4">
                  <Send className="w-3 h-3 mr-2" />
                  SEND A MESSAGE
                </Badge>
                
                <h2 className="font-kanit text-3xl md:text-4xl font-bold text-primary mb-4">
                  Drop Us a Line
                </h2>
                
                <p className="font-sans text-lg text-muted-foreground">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-sans text-foreground font-semibold">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="John Smith"
                    className="border-2 focus:border-accent"
                  />
                  {errors.name && (
                    <p className="font-sans text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-sans text-foreground font-semibold">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="john@example.com"
                    className="border-2 focus:border-accent"
                  />
                  {errors.email && (
                    <p className="font-sans text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-sans text-foreground font-semibold">
                    Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="+44 7XXX XXXXXX"
                    className="border-2 focus:border-accent"
                  />
                  {errors.phone && (
                    <p className="font-sans text-sm text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="font-sans text-foreground font-semibold">
                    Subject *
                  </Label>
                  <Input
                    id="subject"
                    {...register("subject")}
                    placeholder="Course enquiry, career advice, etc."
                    className="border-2 focus:border-accent"
                  />
                  {errors.subject && (
                    <p className="font-sans text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="message" className="font-sans text-foreground font-semibold">
                      Message *
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {charCount}/1000 characters
                    </span>
                  </div>
                  <Textarea
                    id="message"
                    {...register("message")}
                    onChange={(e) => setCharCount(e.target.value.length)}
                    placeholder="Tell us about your career goals, current situation, and how we can help you achieve your dreams..."
                    rows={6}
                    className="border-2 focus:border-accent resize-none transition-all"
                  />
                  {errors.message && (
                    <p className="font-sans text-sm text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-bold text-lg py-7 transition-all hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin"></div>
                      Sending Your Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                      Send Message
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <div className="space-y-3">
                  <p className="font-sans text-sm text-muted-foreground text-center">
                    By submitting this form, you agree to our <a href="/privacy-policy" className="text-accent hover:underline">privacy policy</a> and <a href="/terms-conditions" className="text-accent hover:underline">terms of service</a>.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-accent" />
                    <span>Your information is secure and will never be shared</span>
                  </div>
                </div>
              </form>
            </div>

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
              <InteractiveMap 
                latitude={51.5099}
                longitude={-0.1415}
                address="45 Albemarle Street, Mayfair, London W1S 4JL"
              />
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

      <Footer />
      <ContactChatbot />
      <MobileContactBar />
    </div>
  );
};

export default Contact;
