import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Gift, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sb: any = supabase;

interface ExitIntentPopupProps {
  onClose?: () => void;
}

export function ExitIntentPopup({ onClose }: ExitIntentPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if already shown in this session
    const shown = sessionStorage.getItem("exitIntentShown");
    if (shown) {
      setHasShown(true);
      return;
    }

    let timeOnSite = 0;
    const timer = setInterval(() => {
      timeOnSite += 1;
    }, 1000);

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse leaves from top of page (exit intent)
      if (e.clientY <= 0 && !hasShown && timeOnSite >= 10) {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearInterval(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasShown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Track exit capture
      await sb.from("exit_captures").insert({
        email,
        offer_type: "career_guide",
        converted: true,
      });

      // Update lead score
      await sb.rpc("update_lead_score", {
        p_email: email,
        p_score_change: 25,
        p_behavior: "exit_intent_conversion",
      });

      // Track behavior
      await sb.from("user_behaviors").insert({
        email,
        behavior_type: "exit_intent_conversion",
        score_value: 25,
        behavior_data: { offer: "career_guide" },
      });

      // Sign up for newsletter
      await sb.from("newsletter_subscribers").insert({
        email,
        name,
        source: "exit_intent",
      });

      toast.success("Success! Check your email for the Career Guide.");
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      console.error("Exit intent error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <Gift className="h-6 w-6 text-accent" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Wait! Don't Leave Empty-Handed
          </DialogTitle>
          <DialogDescription className="text-center">
            Get our <strong>FREE Career Switcher's Guide</strong> with proven strategies to land your dream tech job
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              <Download className="mr-2 h-4 w-4" />
              {isSubmitting ? "Sending..." : "Get Free Guide"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              No thanks, I'll pass
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-muted-foreground">
          ✓ Instant download • ✓ No spam • ✓ Unsubscribe anytime
        </div>
      </DialogContent>
    </Dialog>
  );
}
