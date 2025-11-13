import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useToast } from "@/hooks/use-toast";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { supabase } from "@/integrations/supabase/client";

const quickContactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z.string()
    .trim()
    .min(1, { message: "Phone is required" })
    .max(20, { message: "Phone must be less than 20 characters" }),
  message: z.string()
    .trim()
    .min(1, { message: "Message is required" })
    .max(1000, { message: "Message must be less than 1000 characters" }),
});

type QuickContactFormData = z.infer<typeof quickContactSchema>;

interface QuickContactFormModalProps {
  children: React.ReactNode;
}

export function QuickContactFormModal({ children }: QuickContactFormModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { triggerHaptic } = useHapticFeedback();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<QuickContactFormData>({
    resolver: zodResolver(quickContactSchema),
  });

  const onSubmit = async (data: QuickContactFormData) => {
    setIsSubmitting(true);
    triggerHaptic("medium");

    try {
      // @ts-ignore - Table exists but TypeScript types haven't regenerated yet after migration
      const { error } = await supabase.from("form_submissions").insert({
        // @ts-ignore
        form_type: "quick_contact",
        form_data: data,
        submitted_at: new Date().toISOString(),
      });

      if (error) throw error;

      triggerHaptic("success");
      toast({
        title: "✓ Message Sent!",
        description: "We'll get back to you within 5 minutes.",
        duration: 4000,
      });

      reset();
      setOpen(false);
    } catch (error) {
      triggerHaptic("error");
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild onClick={() => triggerHaptic("light")}>
        {children}
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="text-xl font-bold">Quick Contact</DrawerTitle>
              <DrawerDescription>Send us a message instantly</DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="quick-name">Name *</Label>
            <Input
              id="quick-name"
              placeholder="Your full name"
              {...register("name")}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-email">Email *</Label>
            <Input
              id="quick-email"
              type="email"
              placeholder="your@email.com"
              {...register("email")}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-phone">Phone *</Label>
            <Input
              id="quick-phone"
              type="tel"
              placeholder="+44 123 456 7890"
              {...register("phone")}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-message">Message *</Label>
            <Textarea
              id="quick-message"
              placeholder="Tell us how we can help..."
              rows={4}
              {...register("message")}
              className={errors.message ? "border-destructive" : ""}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
