import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, MessageCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { courses } from "@/data/courses";
import { cn } from "@/lib/utils";
import { PhoneInput } from "@/components/forms/PhoneInput";

const formSchema = z.object({
  courseSlug: z.string().min(1, "Please select a course"),
  name: z.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  whatsapp: z.string()
    .trim()
    .min(10, "WhatsApp number is required"),
  joinWhatsappGroup: z.boolean().optional().default(false),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy",
  }),
});

type FormData = z.infer<typeof formSchema>;

export const FreeSessionBookingDialog = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseSlug: "",
      name: "",
      email: "",
      whatsapp: "",
      joinWhatsappGroup: false,
      privacyAccepted: false,
    },
  });

  const selectedCourseData = Object.values(courses).find(
    (course) => course.slug === selectedCourse
  );

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const courseData = Object.values(courses).find((c) => c.slug === data.courseSlug);

      const { error } = await supabase.functions.invoke("submit-course-inquiry", {
        body: {
          courseSlug: data.courseSlug,
          courseTitle: courseData?.title || "",
          inquiryType: "free_session",
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp,
          joinWhatsappGroup: data.joinWhatsappGroup || false,
          whatsappGroupLink: data.joinWhatsappGroup ? selectedCourseData?.whatsappGroupLink : null,
          privacyAccepted: data.privacyAccepted,
        },
      });

      if (error) throw error;

      toast({
        title: data.joinWhatsappGroup 
          ? "✓ Booking submitted! Check your email for WhatsApp group link." 
          : "✓ Booking submitted! We'll contact you shortly.",
        description: data.joinWhatsappGroup
          ? "You'll receive the WhatsApp group link in your confirmation email."
          : "Our team will reach out to schedule your free session.",
      });

      form.reset();
      setOpen(false);
      setSelectedCourse("");
    } catch (error: any) {
      console.error("Error submitting booking:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="lg" 
          className="font-sans text-base font-bold bg-gradient-to-r from-tc-amber to-tc-gold hover:from-tc-gold hover:to-tc-amber text-white shadow-2xl hover:shadow-tc-amber/50 transition-all hover:scale-105 group relative overflow-hidden px-8 py-6"
        >
          <Calendar className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
          <span className="relative z-10">Book Free Session</span>
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-tc-navy">
            Book Your Free Session
          </DialogTitle>
          <DialogDescription className="text-tc-mid-grey">
            Select a course and provide your details. We'll contact you to schedule your
            free session.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
            {/* Course Selection */}
            <FormField
              control={form.control}
              name="courseSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold text-tc-navy">
                    Select Course
                  </FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCourse(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-lg border-tc-light-grey focus:ring-tc-amber">
                        <SelectValue placeholder="Choose a course..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(courses).map((course) => (
                        <SelectItem key={course.slug} value={course.slug}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Full Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold text-tc-navy">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John Doe"
                      {...field}
                      className="h-11 rounded-lg border-tc-light-grey focus-visible:ring-tc-amber"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold text-tc-navy">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                      className="h-11 rounded-lg border-tc-light-grey focus-visible:ring-tc-amber"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* WhatsApp Number Field with Country Code */}
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    label="WhatsApp Number *"
                    required={true}
                  />
                  <p className="text-xs text-tc-mid-grey mt-1">
                    Select your country and enter your phone number
                  </p>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* WhatsApp Group Opt-in - Only show if course has a WhatsApp group */}
            {selectedCourseData?.whatsappGroupLink && (
              <FormField
                control={form.control}
                name="joinWhatsappGroup"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border-2 border-green-200 p-4 bg-green-50/30">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none flex-1">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-green-600" />
                        <FormLabel className="text-sm font-semibold text-tc-navy cursor-pointer">
                          Join the WhatsApp group for this course (optional)
                        </FormLabel>
                      </div>
                      <p className="text-xs text-tc-mid-grey pt-1">
                        Get instant access to course community, updates, and free resources
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            )}

            {/* Privacy Policy */}
            <FormField
              control={form.control}
              name="privacyAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-tc-light-grey p-4 bg-gray-50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-tc-navy cursor-pointer">
                      I agree to the{" "}
                      <a href="/privacy-policy" className="text-tc-amber hover:underline">
                        Privacy Policy
                      </a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-tc-amber hover:bg-tc-amber/90 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Booking"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
