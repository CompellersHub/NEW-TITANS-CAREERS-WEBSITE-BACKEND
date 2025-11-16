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
import { Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { courses } from "@/data/courses";

const formSchema = z.object({
  courseSlug: z.string().min(1, "Please select a course"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  countryCode: z.string().min(1, "Please enter country code"),
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
      phone: "",
      countryCode: "+44",
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
          phone: data.phone,
          countryCode: data.countryCode,
          privacyAccepted: data.privacyAccepted,
        },
      });

      if (error) throw error;

      toast({
        title: "Booking Submitted!",
        description: "We'll contact you shortly to schedule your free session.",
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
        <Button variant="default" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          Book Free Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book Your Free Session</DialogTitle>
          <DialogDescription>
            Select a course and provide your details. We'll contact you to schedule your
            free session.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="courseSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedCourse(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
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

            {selectedCourseData?.whatsappGroupLink && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Want to join the WhatsApp group instead?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(selectedCourseData.whatsappGroupLink, "_blank")
                  }
                  className="w-full"
                >
                  Join WhatsApp Group
                </Button>
              </div>
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-2">
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="+44" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="7123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="privacyAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm">
                      I accept the{" "}
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        className="text-primary underline"
                      >
                        Privacy Policy
                      </a>
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Booking"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
