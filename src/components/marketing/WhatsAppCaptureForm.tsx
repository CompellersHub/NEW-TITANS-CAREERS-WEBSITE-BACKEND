import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface WhatsAppCaptureFormProps {
  onSuccess?: () => void;
  source?: string;
}

const countryCodes = [
  { code: "+44", country: "UK" },
  { code: "+234", country: "Nigeria" },
  { code: "+254", country: "Kenya" },
  { code: "+27", country: "South Africa" },
  { code: "+91", country: "India" },
  { code: "+1", country: "USA/Canada" },
];

const salaryRanges = [
  "Under £20k",
  "£20k - £30k",
  "£30k - £40k",
  "£40k - £50k",
  "£50k+",
];

const targetRoles = [
  "AML/KYC Compliance",
  "Data Analyst",
  "Business Analyst",
  "Project Manager",
  "Cybersecurity Analyst",
  "Data Privacy Officer",
  "Digital Marketing Manager",
];

export const WhatsAppCaptureForm = ({ onSuccess, source = "homepage" }: WhatsAppCaptureFormProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    countryCode: "+44",
    phone: "",
    currentJob: "",
    currentSalary: "",
    targetRole: "",
    targetSalary: "",
  });
  
  const [phoneValid, setPhoneValid] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhoneNumber = (phone: string, countryCode: string) => {
    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, "");
    
    // Basic validation: 7-15 digits
    const phoneRegex = /^\d{7,15}$/;
    const isValid = phoneRegex.test(cleaned);
    
    setPhoneValid(isValid);
    return isValid;
  };

  const handlePhoneChange = (value: string) => {
    setFormData({ ...formData, phone: value });
    if (value.length > 6) {
      validatePhoneNumber(value, formData.countryCode);
    } else {
      setPhoneValid(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneValid) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save to database
      const { error } = await supabase.from("form_submissions").insert({
        form_type: "whatsapp_capture",
        form_data: {
          ...formData,
          fullPhone: `${formData.countryCode}${formData.phone}`,
          source,
          timestamp: new Date().toISOString(),
        },
      });

      if (error) throw error;

      // Generate WhatsApp message
      const message = encodeURIComponent(
        `Hi Titans Careers, I've just signed up on your website. I'd like help with changing careers. My name is ${formData.fullName}.`
      );
      const whatsappLink = `https://wa.me/447539434403?text=${message}`;

      toast.success("Success! Redirecting you to WhatsApp...", {
        description: "We'll be in touch shortly to discuss your career goals.",
      });

      // Redirect to WhatsApp
      setTimeout(() => {
        window.open(whatsappLink, "_blank");
        onSuccess?.();
      }, 1500);

    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          required
          value={formData.fullName}
          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          placeholder="Enter your full name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="your.email@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country *</Label>
        <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select your country" />
          </SelectTrigger>
          <SelectContent>
            {countryCodes.map((c) => (
              <SelectItem key={c.country} value={c.country}>
                {c.country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">WhatsApp Phone Number *</Label>
        <div className="flex gap-2">
          <Select value={formData.countryCode} onValueChange={(value) => setFormData({ ...formData, countryCode: value })}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Input
              id="phone"
              required
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="123456789"
              className={phoneValid === true ? "pr-10" : phoneValid === false ? "border-destructive" : ""}
            />
            {phoneValid === true && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
            )}
            {phoneValid === false && (
              <X className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-destructive" />
            )}
          </div>
        </div>
        {phoneValid === false && (
          <p className="text-sm text-destructive">Please enter a valid phone number (7-15 digits)</p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentJob">Current Job Title</Label>
          <Input
            id="currentJob"
            value={formData.currentJob}
            onChange={(e) => setFormData({ ...formData, currentJob: e.target.value })}
            placeholder="e.g., Retail Assistant"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentSalary">Current Salary Range</Label>
          <Select value={formData.currentSalary} onValueChange={(value) => setFormData({ ...formData, currentSalary: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {salaryRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetRole">Target Role *</Label>
          <Select required value={formData.targetRole} onValueChange={(value) => setFormData({ ...formData, targetRole: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select target role" />
            </SelectTrigger>
            <SelectContent>
              {targetRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetSalary">Target Salary Range *</Label>
          <Select required value={formData.targetSalary} onValueChange={(value) => setFormData({ ...formData, targetSalary: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {salaryRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isSubmitting || !phoneValid}
      >
        <MessageCircle className="w-5 h-5 mr-2" />
        {isSubmitting ? "Processing..." : "Join WhatsApp Career Community"}
      </Button>

      <p className="text-sm text-muted-foreground text-center">
        We respect your privacy. Your information is secure and will only be used to help you achieve your career goals.
      </p>
    </form>
  );
};
