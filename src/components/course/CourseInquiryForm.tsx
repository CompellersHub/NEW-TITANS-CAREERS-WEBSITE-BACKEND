import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useBehaviorTracking } from "@/hooks/useBehaviorTracking";

const courseInquirySchema = z.object({
  name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  phone: z.string()
    .trim()
    .min(10, "Please enter a valid phone number")
    .refine((val) => val.includes('+'), "Phone number must include country code"),
  privacyAccepted: z.boolean()
    .refine((val) => val === true, "You must accept the privacy policy"),
});

type CourseInquiryFormData = z.infer<typeof courseInquirySchema>;

interface CourseInquiryFormProps {
  courseSlug: string;
  courseTitle: string;
  inquiryType: "free_session" | "whatsapp_group";
  onSuccess: () => void;
  onBack: () => void;
}

export function CourseInquiryForm({
  courseSlug,
  courseTitle,
  inquiryType,
  onSuccess,
  onBack,
}: CourseInquiryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { trackCourseInquiry, trackBehavior } = useBehaviorTracking();

  const form = useForm<CourseInquiryFormData>({
    resolver: zodResolver(courseInquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      privacyAccepted: false,
    },
  });

  const onSubmit = async (data: CourseInquiryFormData) => {
    setIsSubmitting(true);
    
    try {
      // Track inquiry type selection
      trackBehavior("inquiry_type_selected", 10, {
        course: courseSlug,
        inquiryType: inquiryType,
      });

      // Insert into database
      const { error: dbError } = await supabase
        .from("course_inquiries")
        .insert({
          course_slug: courseSlug,
          course_title: courseTitle,
          inquiry_type: inquiryType,
          name: data.name,
          email: data.email,
          phone: data.phone,
          country_code: "+44", // Default for now
          privacy_accepted: data.privacyAccepted,
        });

      if (dbError) throw dbError;

      // Call edge function to send emails
      const { error: emailError } = await supabase.functions.invoke(
        "submit-course-inquiry",
        {
          body: {
            courseSlug,
            courseTitle,
            inquiryType,
            name: data.name,
            email: data.email,
            phone: data.phone,
          },
        }
      );

      if (emailError) {
        console.error("Email error:", emailError);
        // Don't throw - inquiry is still saved
      }

      // Track successful submission
      trackCourseInquiry(courseSlug, inquiryType, data.email);
      trackBehavior("course_inquiry_submitted", 25, {
        course: courseSlug,
        inquiryType: inquiryType,
        conversionSource: "floating_cta",
      });

      toast.success(
        inquiryType === "free_session"
          ? "Request submitted! We'll contact you within 24 hours."
          : "Success! Check your email for the WhatsApp group link."
      );

      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 3000);
    } catch (error) {
      console.error("Submission error:", error);
      
      // Track failure
      trackBehavior("course_inquiry_failed", 0, {
        course: courseSlug,
        inquiryType: inquiryType,
        error: String(error),
      });
      
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-accent" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">Request Submitted!</h3>
          <p className="text-muted-foreground">
            {inquiryType === "free_session"
              ? "We'll contact you within 24 hours to schedule your free consultation."
              : "Check your email for the WhatsApp group invite link."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Number *</FormLabel>
              <FormControl>
                <PhoneInput
                  value={field.value}
                  onChange={field.onChange}
                  label=""
                  required
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="privacyAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal cursor-pointer">
                  I accept the{" "}
                  <Link
                    to="/privacy-policy"
                    target="_blank"
                    className="text-accent hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and agree to be contacted via WhatsApp and email.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
            className="flex-1 bg-gradient-to-r from-accent to-gold hover:opacity-90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
