import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileText, CheckCircle } from "lucide-react";

const sb: any = supabase;

interface LeadMagnet {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  course_related: string | null;
}

interface LeadMagnetModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadMagnetId?: string;
}

export function LeadMagnetModal({ isOpen, onClose, leadMagnetId }: LeadMagnetModalProps) {
  const [leadMagnets, setLeadMagnets] = useState<LeadMagnet[]>([]);
  const [selectedMagnet, setSelectedMagnet] = useState<LeadMagnet | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    fetchLeadMagnets();
  }, []);

  useEffect(() => {
    if (leadMagnetId && leadMagnets.length > 0) {
      const magnet = leadMagnets.find((m) => m.id === leadMagnetId);
      if (magnet) setSelectedMagnet(magnet);
    }
  }, [leadMagnetId, leadMagnets]);

  const fetchLeadMagnets = async () => {
    const { data, error } = await sb
      .from("lead_magnets")
      .select("*")
      .eq("active", true);

    if (error) {
      console.error("Error fetching lead magnets:", error);
      return;
    }

    setLeadMagnets(data || []);
    if (data && data.length > 0 && !selectedMagnet) {
      setSelectedMagnet(data[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMagnet) return;

    setIsSubmitting(true);

    try {
      // Track download
      await sb.from("lead_magnet_downloads").insert({
        email,
        name,
        lead_magnet_id: selectedMagnet.id,
      });

      // Update lead score
      await sb.rpc("update_lead_score", {
        p_email: email,
        p_score_change: 20,
        p_behavior: "lead_magnet_download",
      });

      // Track behavior
      await sb.from("user_behaviors").insert({
        email,
        behavior_type: "lead_magnet_download",
        score_value: 20,
        behavior_data: {
          lead_magnet: selectedMagnet.id,
          title: selectedMagnet.title,
        },
      });

      // Subscribe to newsletter
      await sb.from("newsletter_subscribers").insert({
        email,
        name,
        source: "lead_magnet",
      });

      setDownloaded(true);
      toast.success("Success! Check your email for the download link.");

      // Auto close after 3 seconds
      setTimeout(() => {
        onClose();
        setDownloaded(false);
      }, 3000);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (downloaded) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center space-y-4 py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl">Check Your Email!</DialogTitle>
            <DialogDescription>
              We've sent <strong>{selectedMagnet?.title}</strong> to {email}
            </DialogDescription>
            <p className="text-sm text-muted-foreground">
              Don't see it? Check your spam folder.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
            <FileText className="h-6 w-6 text-accent" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Free Career Resources
          </DialogTitle>
          <DialogDescription className="text-center">
            Download our proven career guides and resources
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {leadMagnets.slice(0, 4).map((magnet) => (
            <button
              key={magnet.id}
              onClick={() => setSelectedMagnet(magnet)}
              className={`text-left p-4 rounded-lg border transition-all ${
                selectedMagnet?.id === magnet.id
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <Download className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm mb-1 line-clamp-1">
                    {magnet.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {magnet.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedMagnet && (
          <div className="bg-accent/5 rounded-lg p-4 border border-accent/20">
            <h4 className="font-semibold mb-2">{selectedMagnet.title}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedMagnet.description}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
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
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Download className="mr-2 h-4 w-4" />
                {isSubmitting ? "Sending..." : "Get Free Download"}
              </Button>
            </form>
          </div>
        )}

        <div className="text-center text-xs text-muted-foreground">
          ✓ Instant access • ✓ No spam • ✓ Unsubscribe anytime
        </div>
      </DialogContent>
    </Dialog>
  );
}
