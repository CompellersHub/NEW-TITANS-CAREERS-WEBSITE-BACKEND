import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, User, Building2, MessageSquare } from "lucide-react";
import { trackFormSubmission, trackLead } from "@/lib/analytics";

export const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      company: formData.get('company') as string,
      phone: formData.get('phone') as string,
      message: formData.get('message') as string,
    };
    
    // Store user info for abandoned checkout tracking
    localStorage.setItem('userEmail', data.email);
    localStorage.setItem('userName', data.name);
    if (data.phone) {
      localStorage.setItem('userPhone', data.phone);
    }
    
    // Track form submission
    trackFormSubmission('contact_form', {
      form_type: 'contact',
      company: data.company
    });
    
    // Track lead generation
    trackLead('contact_form', {
      lead_name: data.name,
      lead_company: data.company
    });
    
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
            <h2 className="font-kanit text-4xl md:text-5xl font-bold tracking-tight text-primary">
              Get Started Today
            </h2>
            <p className="font-sans text-xl text-muted-foreground">
              Let's discuss how Titan Careers can transform your hiring process
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-sans text-sm font-medium flex items-center gap-2 text-foreground">
                  <User className="w-4 h-4 text-primary" />
                  Full Name
                </label>
                <Input 
                  name="name"
                  placeholder="John Doe" 
                  required 
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <label className="font-sans text-sm font-medium flex items-center gap-2 text-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  Work Email
                </label>
                <Input 
                  name="email"
                  type="email" 
                  placeholder="john@company.com" 
                  required 
                  className="h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-sans text-sm font-medium flex items-center gap-2 text-foreground">
                  <Building2 className="w-4 h-4 text-primary" />
                  Company Name
                </label>
                <Input 
                  name="company"
                  placeholder="Your Company" 
                  required 
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="font-sans text-sm font-medium flex items-center gap-2 text-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  Phone Number (Optional)
                </label>
                <Input 
                  name="phone"
                  type="tel" 
                  placeholder="+44 7123 456789" 
                  className="h-12"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="font-sans text-sm font-medium flex items-center gap-2 text-foreground">
                <MessageSquare className="w-4 h-4 text-primary" />
                How can we help?
              </label>
              <Textarea 
                name="message"
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
            
            <p className="font-sans text-center text-sm text-muted-foreground">
              By submitting this form, you agree to our privacy policy and terms of service.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};
