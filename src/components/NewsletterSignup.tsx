import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { CheckCircle, AlertCircle } from "lucide-react";

const newsletterSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  whatsapp: z.string().trim().regex(/^\+\d{1,4}\s?\d{6,14}$/, "Please enter a valid WhatsApp number with country code (e.g., +44 7XXX XXXXXX)"),
  interest: z.enum(["AML/KYC", "Data Analysis", "Business Analysis", "Cybersecurity", "Data Privacy", "Digital Marketing", "Crypto & Digital Assets"], {
    errorMap: () => ({ message: "Please select an area of interest" })
  }),
  consent: z.boolean().refine(val => val === true, "You must agree to receive updates")
});

interface NewsletterSignupProps {
  variant?: "inline" | "card" | "minimal";
  source?: string;
  showWhatsApp?: boolean;
  showName?: boolean;
}

export const NewsletterSignup = ({ 
  variant = "inline", 
  source = "unknown",
  showWhatsApp = false,
  showName = false 
}: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [interest, setInterest] = useState("");
  const [consent, setConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappValid, setWhatsappValid] = useState<boolean | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateWhatsApp = (value: string) => {
    const regex = /^\+\d{1,4}\s?\d{6,14}$/;
    if (value.length > 5) {
      setWhatsappValid(regex.test(value));
    } else {
      setWhatsappValid(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowSuccess(false);

    try {
      // Validate all fields
      const validationResult = newsletterSchema.safeParse({
        name,
        email,
        whatsapp,
        interest,
        consent
      });

      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast.error(firstError.message);
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.functions.invoke("newsletter-signup", {
        body: { 
          email: email.trim(),
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          interest,
          consent,
          source 
        },
      });

      if (error) {
        console.error("Newsletter signup error:", error);
        toast.error(error.message || "Failed to subscribe. Please try again.");
        return;
      }

      setShowSuccess(true);
      setEmail("");
      setName("");
      setWhatsapp("");
      setInterest("");
      setConsent(false);
      setWhatsappValid(null);
      
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error("Newsletter signup error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "minimal") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    );
  }

  if (variant === "card") {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-tc-light-grey/50">
        <h3 className="text-2xl font-bold text-tc-navy mb-2">Get Career Insights</h3>
        <p className="text-tc-mid-grey mb-6 text-sm">Join our weekly newsletter</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-tc-navy font-semibold mb-2">First Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Your first name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-tc-navy font-semibold mb-2">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="whatsapp" className="text-tc-navy font-semibold mb-2">WhatsApp Number</Label>
            <div className="relative">
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+44 7XXX XXXXXX"
                value={whatsapp}
                onChange={(e) => {
                  setWhatsapp(e.target.value);
                  validateWhatsApp(e.target.value);
                }}
                required
                className={`mt-1 pr-10 ${whatsappValid === false ? 'border-red-500' : whatsappValid === true ? 'border-green-500' : ''}`}
              />
              {whatsappValid === true && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
              {whatsappValid === false && (
                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-500" />
              )}
            </div>
            {whatsappValid === false && (
              <p className="text-red-500 text-xs mt-1">Please enter a valid number including country code</p>
            )}
          </div>

          <div>
            <Label htmlFor="interest" className="text-tc-navy font-semibold mb-2">I'm most interested in:</Label>
            <Select value={interest} onValueChange={setInterest} required>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a course area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AML/KYC">AML/KYC</SelectItem>
                <SelectItem value="Data Analysis">Data Analysis</SelectItem>
                <SelectItem value="Business Analysis">Business Analysis</SelectItem>
                <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                <SelectItem value="Data Privacy">Data Privacy</SelectItem>
                <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                <SelectItem value="Crypto & Digital Assets">Crypto & Digital Assets</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <Checkbox
              id="consent"
              checked={consent}
              onCheckedChange={(checked) => setConsent(checked as boolean)}
              required
              className="mt-1"
            />
            <Label htmlFor="consent" className="text-tc-mid-grey text-sm leading-tight cursor-pointer">
              I agree to receive career tips and course updates from Titans Careers.
            </Label>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-tc-amber hover:bg-tc-amber/90 text-white font-bold py-6 rounded-lg"
          >
            {isLoading ? "Subscribing..." : "Get Weekly Career Tips"}
          </Button>

          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-green-700 font-semibold">
                Thanks! Check your inbox and WhatsApp for your first set of tips.
              </p>
            </div>
          )}
        </form>
      </div>
    );
  }

  // Default inline variant
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {showName && (
        <div>
          <Label htmlFor="inline-name">Name</Label>
          <Input
            id="inline-name"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}

      <div>
        <Label htmlFor="inline-email">Email</Label>
        <Input
          id="inline-email"
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      {showWhatsApp && (
        <div>
          <Label htmlFor="inline-whatsapp">WhatsApp (optional)</Label>
          <Input
            id="inline-whatsapp"
            type="tel"
            placeholder="+44 7XXX XXXXXX"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>
      )}

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
};
