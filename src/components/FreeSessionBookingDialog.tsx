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
import { Calendar, CheckCircle2, XCircle, MessageCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { courses } from "@/data/courses";
import { cn } from "@/lib/utils";

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
    .regex(/^\+\d{1,4}\s?\d{6,14}$/, "Please enter a valid WhatsApp number with country code (e.g., +44 7123456789)")
    .min(10, "WhatsApp number is too short")
    .max(20, "WhatsApp number is too long"),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the privacy policy",
  }),
});

type FormData = z.infer<typeof formSchema>;

export const FreeSessionBookingDialog = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [whatsappValid, setWhatsappValid] = useState<boolean | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseSlug: "",
      name: "",
      email: "",
      whatsapp: "",
      privacyAccepted: false,
    },
  });

  const selectedCourseData = Object.values(courses).find(
    (course) => course.slug === selectedCourse
  );

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("whatsapp", value, { shouldValidate: false });
    
    // Only validate if user has typed at least 8 characters
    if (value.length >= 8) {
      const regex = /^\+\d{1,4}\s?\d{6,14}$/;
      const isValid = regex.test(value);
      setWhatsappValid(isValid);
    } else if (value.length === 0) {
      setWhatsappValid(null); // Reset if empty
    } else {
      setWhatsappValid(null); // Neutral while typing
    }
  };

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
          privacyAccepted: data.privacyAccepted,
        },
      });

      if (error) throw error;

      toast({
        title: "✓ Booking Submitted!",
        description: "We'll contact you shortly to schedule your free session.",
      });

      form.reset();
      setWhatsappValid(null);
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
        <Button variant="default" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          Book Free Session
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

            {/* WhatsApp Number with Validation */}
            <FormField
              control={form.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-bold text-tc-navy">
                    WhatsApp Number
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+44 7123456789"
                        onChange={handleWhatsAppChange}
                        className={cn(
                          "h-11 rounded-lg pr-10 border-tc-light-grey",
                          whatsappValid === true && "border-green-500 focus-visible:ring-green-500",
                          whatsappValid === false && "border-red-500 focus-visible:ring-red-500",
                          whatsappValid === null && "focus-visible:ring-tc-amber"
                        )}
                        aria-invalid={whatsappValid === false}
                        aria-describedby={whatsappValid === false ? "whatsapp-error" : undefined}
                      />
                    </FormControl>
                    {/* Validation icon */}
                    {whatsappValid === true && (
                      <CheckCircle2 
                        className="absolute right-3 top-3 h-5 w-5 text-green-500" 
                        aria-label="Valid WhatsApp number"
                      />
                    )}
                    {whatsappValid === false && (
                      <XCircle 
                        className="absolute right-3 top-3 h-5 w-5 text-red-500" 
                        aria-label="Invalid WhatsApp number"
                      />
                    )}
                  </div>
                  {whatsappValid === true && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Valid WhatsApp number
                    </p>
                  )}
                  <FormMessage id="whatsapp-error" />
                </FormItem>
              )}
            />

            {/* WhatsApp Group Option (AFTER all input fields) */}
            {selectedCourseData?.whatsappGroupLink && (
              <div className="border-l-4 border-tc-amber bg-amber-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-tc-amber mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-tc-navy mb-2">
                      Want to join the WhatsApp group instead?
                    </p>
                    <p className="text-xs text-tc-mid-grey mb-3">
                      Get instant access to the course community and updates
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedCourseData.whatsappGroupLink, "_blank")}
                      className="w-full border-tc-amber text-tc-amber hover:bg-tc-amber hover:text-white transition-all"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Join WhatsApp Group
                    </Button>
                  </div>
                </div>
              </div>
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
              disabled={isSubmitting || whatsappValid === false}
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
