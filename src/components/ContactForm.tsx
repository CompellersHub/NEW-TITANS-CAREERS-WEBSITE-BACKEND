import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, User, Building2, MessageSquare } from "lucide-react";

export const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours.",
    });
    
    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  return (
    <section id="contact" className="py-24 bg-muted/30">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Get Started Today
            </h2>
            <p className="text-xl text-muted-foreground">
              Let's discuss how Titan Careers can transform your hiring process
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name
                </label>
                <Input 
                  placeholder="John Doe" 
                  required 
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Work Email
                </label>
                <Input 
                  type="email" 
                  placeholder="john@company.com" 
                  required 
                  className="h-12"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Company Name
              </label>
              <Input 
                placeholder="Your Company" 
                required 
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                How can we help?
              </label>
              <Textarea 
                placeholder="Tell us about your hiring goals and challenges..."
                rows={5}
                required
                className="resize-none"
              />
            </div>
            
            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-lg py-6 shadow-lg hover:shadow-xl transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Request Demo"}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              By submitting this form, you agree to our privacy policy and terms of service.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};
