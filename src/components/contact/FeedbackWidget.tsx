import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useHapticFeedback } from "@/hooks/useHapticFeedback";
import { supabase } from "@/integrations/supabase/client";

export function FeedbackWidget() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { toast } = useToast();
  const { triggerHaptic } = useHapticFeedback();

  useEffect(() => {
    const handleScroll = () => {
      if (isDismissed || hasSubmitted) return;

      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const scrollPercentage = (scrollPosition / scrollHeight) * 100;

      // Show widget when user scrolls past 70%
      if (scrollPercentage >= 70 && !isVisible) {
        setIsVisible(true);
        triggerHaptic("light");
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDismissed, isVisible, hasSubmitted, triggerHaptic]);

  const handleFeedbackClick = (type: "positive" | "negative") => {
    triggerHaptic("medium");
    setFeedback(type);
  };

  const handleSubmit = async () => {
    if (!feedback) return;

    setIsSubmitting(true);
    triggerHaptic("medium");

    try {
      // @ts-ignore - Table exists but TypeScript types haven't regenerated yet
      const { error } = await supabase.from("form_submissions").insert({
        // @ts-ignore
        form_type: "page_feedback",
        form_data: {
          page: "contact",
          feedback_type: feedback,
          comment: comment.trim() || null,
          timestamp: new Date().toISOString(),
        },
        submitted_at: new Date().toISOString(),
      });

      if (error) throw error;

      triggerHaptic("success");
      toast({
        title: "✓ Thank you for your feedback!",
        description: "Your input helps us improve our website.",
        duration: 3000,
      });

      setHasSubmitted(true);
      
      // Auto-dismiss after showing success
      setTimeout(() => {
        setIsVisible(false);
      }, 2000);
    } catch (error) {
      triggerHaptic("error");
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    triggerHaptic("light");
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible || isDismissed || hasSubmitted) return null;

  return (
    <div
      className="fixed bottom-24 right-4 z-40 w-80 bg-background border-2 border-accent/30 rounded-lg shadow-2xl animate-fade-in md:bottom-8"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="font-bold text-foreground">Quick Feedback</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-8 w-8 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Did you find what you were looking for?
        </p>

        {/* Feedback Buttons */}
        <div className="flex gap-3">
          <Button
            variant={feedback === "positive" ? "default" : "outline"}
            className={`flex-1 h-12 transition-all ${
              feedback === "positive"
                ? "bg-success hover:bg-success/90 text-white"
                : "hover:border-success hover:text-success"
            }`}
            onClick={() => handleFeedbackClick("positive")}
          >
            <ThumbsUp className="mr-2 h-5 w-5" />
            Yes
          </Button>
          <Button
            variant={feedback === "negative" ? "default" : "outline"}
            className={`flex-1 h-12 transition-all ${
              feedback === "negative"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "hover:border-red-500 hover:text-red-500"
            }`}
            onClick={() => handleFeedbackClick("negative")}
          >
            <ThumbsDown className="mr-2 h-5 w-5" />
            No
          </Button>
        </div>

        {/* Comment Field (shown after feedback selection) */}
        {feedback && (
          <div className="space-y-2 animate-fade-in">
            <label className="text-xs text-muted-foreground">
              Any additional comments? (Optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                feedback === "positive"
                  ? "What did you like most?"
                  : "What could we improve?"
              }
              rows={3}
              maxLength={500}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/500
            </p>
          </div>
        )}

        {/* Submit Button */}
        {feedback && (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full h-10 bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
