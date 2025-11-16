import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, Loader2, CheckCircle2 } from "lucide-react";

const careerConsultationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  country: z.string().min(1, "Please select a country"),
  phone: z.string().min(8, "Valid phone number required"),
});

type CareerConsultationData = z.infer<typeof careerConsultationSchema>;

const countries = [
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "NG", name: "Nigeria" },
  { code: "IN", name: "India" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "ZA", name: "South Africa" },
  { code: "KE", name: "Kenya" },
  { code: "GH", name: "Ghana" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
];

// Replace with your actual WhatsApp business number
const WHATSAPP_BUSINESS_NUMBER = "447123456789";

export const CareerConsultationForm = () => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CareerConsultationData>({
    resolver: zodResolver(careerConsultationSchema),
  });

  const country = watch("country");

  const onSubmit = async (data: CareerConsultationData) => {
    try {
      // Save to Supabase
      const { error } = await supabase.from("form_submissions").insert({
        form_type: "career_consultation",
        form_data: {
          ...data,
          submitted_at: new Date().toISOString(),
        },
        status: "new",
        priority: "high",
      });

      if (error) throw error;

      // Generate WhatsApp message
      const whatsappMessage = `Hi! I'm interested in career consultation.

*Personal Details:*
Name: ${data.name}
Email: ${data.email}
Country: ${countries.find(c => c.code === data.country)?.name}
Phone: ${data.phone}

Looking forward to discussing my career progression!`;

      const whatsappUrl = `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

      toast({
        title: "Success!",
        description: "Your details have been saved. Redirecting to WhatsApp...",
      });

      // Redirect to WhatsApp after a short delay
      setTimeout(() => {
        window.open(whatsappUrl, "_blank");
        reset();
        setPhoneNumber("");
      }, 1500);

    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Check if phone is valid (has country code and number)
  const checkPhoneValidity = (value: string) => {
    const parts = value.split(" ");
    if (parts.length === 2 && parts[1].length >= 8) {
      setIsPhoneValid(true);
    } else {
      setIsPhoneValid(false);
    }
  };

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-gold/5 rounded-3xl" />
      
      <div className="relative bg-card/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-border/50">
        <div className="mb-8">
          <h2 className="text-3xl font-kanit font-bold text-primary mb-2">
            Career Consultation Request
          </h2>
          <p className="text-muted-foreground">
            Share your details and we'll connect with you on WhatsApp to discuss your career goals.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-semibold">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="John Doe"
              className="border-2 focus:border-accent"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-semibold">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="john@example.com"
              className="border-2 focus:border-accent"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-foreground font-semibold">
              Country <span className="text-destructive">*</span>
            </Label>
            <Select
              value={country}
              onValueChange={(value) => setValue("country", value)}
            >
              <SelectTrigger className="border-2 focus:border-accent">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country.message}</p>
            )}
          </div>

          {/* Phone with validation */}
          <PhoneInput
            value={phoneNumber}
            onChange={(value) => {
              setPhoneNumber(value);
              setValue("phone", value);
              checkPhoneValidity(value);
            }}
            label="WhatsApp Number"
            required
            error={errors.phone?.message}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !isPhoneValid}
            className="w-full bg-gradient-to-r from-accent via-gold to-accent bg-[length:200%_100%] hover:bg-[position:100%_0] text-primary-foreground font-semibold py-6 text-lg transition-all duration-500 shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <MessageCircle className="mr-2 h-5 w-5" />
                Submit & Connect on WhatsApp
                {isPhoneValid && <CheckCircle2 className="ml-2 h-5 w-5 text-success" />}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            By submitting, you agree to receive career consultation via WhatsApp. Your data is securely stored and never shared.
          </p>
        </form>
      </div>
    </div>
  );
};
