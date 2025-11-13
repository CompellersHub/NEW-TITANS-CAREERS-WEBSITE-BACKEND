import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Copy, Mail, Share2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sb: any = supabase;

interface ReferralProgramProps {
  userEmail?: string;
}

export function ReferralProgram({ userEmail }: ReferralProgramProps) {
  const [referralEmail, setReferralEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const referralLink = userEmail
    ? `${window.location.origin}?ref=${btoa(userEmail)}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmail) {
      toast.error("Please sign in to send referrals");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create referral
      await sb.from("referrals").insert({
        referrer_email: userEmail,
        referred_email: referralEmail,
        status: "pending",
      });

      // Track behavior
      await sb.from("user_behaviors").insert({
        email: userEmail,
        behavior_type: "referral_sent",
        score_value: 10,
        behavior_data: { referred: referralEmail },
      });

      toast.success("Referral sent! You'll get a reward when they enroll.");
      setReferralEmail("");
    } catch (error) {
      console.error("Referral error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Transform Your Career with Titans Careers",
          text: "Check out these amazing career training courses!",
          url: referralLink,
        });
      } catch (error) {
        console.error("Share error:", error);
      }
    } else {
      handleCopyLink();
    }
  };

  if (!userEmail) {
    return (
      <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
            <Gift className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Refer & Earn Rewards</h3>
            <p className="text-muted-foreground text-sm">
              Sign in to get your unique referral link and earn rewards
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 mb-4">
            <Gift className="h-6 w-6 text-accent" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Refer Friends, Get Rewards</h3>
          <p className="text-muted-foreground text-sm">
            Earn £50 for every friend who enrolls in a course
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="bg-background"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="flex-shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleShare}
              className="flex-shrink-0"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSendReferral} className="flex gap-2">
            <Input
              type="email"
              placeholder="Friend's email"
              value={referralEmail}
              onChange={(e) => setReferralEmail(e.target.value)}
              required
              className="bg-background"
            />
            <Button type="submit" disabled={isSubmitting} className="flex-shrink-0">
              <Mail className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-accent/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">£50</div>
            <div className="text-xs text-muted-foreground">Per Referral</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">20%</div>
            <div className="text-xs text-muted-foreground">Friend's Discount</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">∞</div>
            <div className="text-xs text-muted-foreground">Unlimited Refs</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
