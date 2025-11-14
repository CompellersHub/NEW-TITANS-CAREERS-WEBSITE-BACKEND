import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Mail, User, Building2, MessageSquare, ExternalLink } from "lucide-react";
import { trackFormSubmission, trackLead } from "@/lib/analytics";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { z } from "zod";

const contactFormSchema = z.object({
  name: z.string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  company: z.string()
    .trim()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  whatsapp: z.string()
    .trim()
    .min(8, "WhatsApp number is required")
    .max(20, "WhatsApp number must be less than 20 characters"),
  message: z.string()
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message must be less than 1000 characters"),
  agreedToPrivacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the privacy policy"
  })
});

export const ContactForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const rawData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        company: formData.get('company') as string,
        whatsapp: whatsappNumber,
        message: formData.get('message') as string,
        agreedToPrivacy,
      };
      
      // Validate input data
      const validationResult = contactFormSchema.safeParse(rawData);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors;
        toast({
          title: "Validation Error",
          description: errors[0].message,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const data = validationResult.data;
      
      // Store validated user info for abandoned checkout tracking
      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userWhatsApp', data.whatsapp);
      
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
      setWhatsappNumber('');
      setAgreedToPrivacy(false);
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
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

              <div>
                <PhoneInput
                  value={whatsappNumber}
                  onChange={setWhatsappNumber}
                  label="WhatsApp Number"
                  required
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

            {/* Privacy Policy Agreement */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-muted/30 to-secondary/20 rounded-xl border-2 border-accent/20">
              <Checkbox 
                id="privacy"
                checked={agreedToPrivacy}
                onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
              />
              <label htmlFor="privacy" className="text-sm font-medium leading-relaxed cursor-pointer">
                I have read and agree to the{' '}
                <a 
                  href="/privacy-policy" 
                  target="_blank" 
                  className="text-accent hover:text-gold underline font-semibold inline-flex items-center gap-1"
                >
                  Privacy Policy
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>
            </div>
            
            <Button 
              type="submit" 
              size="lg" 
              className="w-full text-lg py-6 bg-gradient-to-r from-accent to-gold hover:from-accent/90 hover:to-gold/90 text-primary shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              disabled={isSubmitting || !agreedToPrivacy}
            >
              {isSubmitting ? "Sending..." : "Request Demo"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
