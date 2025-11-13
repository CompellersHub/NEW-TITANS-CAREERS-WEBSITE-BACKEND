import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Loader2, Send } from "lucide-react";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }).max(255),
  name: z.string().trim().max(100).optional(),
  whatsapp: z.string().trim().max(50).optional(),
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
  const [whatsapp, setWhatsApp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    try {
      newsletterSchema.parse({ email, name, whatsapp });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("newsletter-signup", {
        body: {
          email: email.trim(),
          name: name.trim() || undefined,
          whatsapp: whatsapp.trim() || undefined,
          source,
        },
      });

      if (error) {
        console.error("Newsletter signup error:", error);
        throw error;
      }

      toast({
        title: "Success! 🎉",
        description: data.message || "You've successfully subscribed to our newsletter!",
      });

      // Clear form
      setEmail("");
      setName("");
      setWhatsApp("");
    } catch (error: any) {
      console.error("Error subscribing to newsletter:", error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === "minimal") {
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading} size="sm">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    );
  }

  if (variant === "card") {
    return (
      <div className="bg-gradient-to-br from-tc-navy to-tc-blue text-white p-8 rounded-xl shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-tc-amber/20 rounded-full flex items-center justify-center">
            <Mail className="w-6 h-6 text-tc-amber" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Get Career Insights</h3>
            <p className="text-white/80 text-sm">Weekly tips delivered to your inbox</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {showName && (
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          )}
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
          />
          {showWhatsApp && (
            <Input
              type="tel"
              placeholder="WhatsApp number (optional)"
              value={whatsapp}
              onChange={(e) => setWhatsApp(e.target.value)}
              disabled={isLoading}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-tc-amber hover:bg-tc-gold text-tc-navy font-bold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Subscribe Now
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-white/60 mt-3 text-center">
          Free career tips. Unsubscribe anytime.
        </p>
      </div>
    );
  }

  // Inline variant (default)
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {showName && (
        <Input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      )}
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Subscribe"
          )}
        </Button>
      </div>
      {showWhatsApp && (
        <Input
          type="tel"
          placeholder="WhatsApp number (optional)"
          value={whatsapp}
          onChange={(e) => setWhatsApp(e.target.value)}
          disabled={isLoading}
          className="text-sm"
        />
      )}
    </form>
  );
};
