import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface DigestPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frequency: string;
  digestTime: number;
}

export const DigestPreviewDialog = ({ open, onOpenChange, frequency, digestTime }: DigestPreviewDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  const fetchPreviewData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch recent notifications from the last 7 days to have enough data
      const { data: notifications, error } = await supabase
        .from("user_notifications")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!notifications || notifications.length === 0) {
        toast.info("No recent notifications to preview", {
          description: "Participate in discussions to see how your digest will look!",
        });
        setPreviewHtml("");
        return;
      }

      // Group by type
      const replyNotifications = notifications.filter((n) => n.type === "reply");
      const mentionNotifications = notifications.filter((n) => n.type === "mention");

      // Generate preview HTML similar to the digest email
      const html = generatePreviewHtml(replyNotifications, mentionNotifications, frequency, digestTime);
      setPreviewHtml(html);
    } catch (error: any) {
      console.error("Error fetching preview:", error);
      toast.error("Failed to load preview", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePreviewHtml = (
    replies: any[],
    mentions: any[],
    freq: string,
    time: number
  ) => {
    const timeStr = time.toString().padStart(2, "0") + ":00";
    const frequencyText = freq === "daily" ? "Daily" : "Weekly";

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0 0 10px 0;">📬 ${frequencyText} Discussion Digest</h1>
            <p style="color: #6b7280; margin: 0;">Preview of notifications from your courses</p>
          </div>

          ${replies.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h2 style="color: #374151; font-size: 18px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
                💬 New Replies (${replies.length})
              </h2>
              ${replies.slice(0, 5).map((notif) => `
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                  <p style="margin: 0 0 8px 0; color: #1f2937; font-weight: 600;">${notif.title}</p>
                  <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">${notif.message}</p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">${format(new Date(notif.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              `).join("")}
              ${replies.length > 5 ? `<p style="color: #6b7280; font-size: 14px; text-align: center; margin: 10px 0;">And ${replies.length - 5} more...</p>` : ""}
            </div>
          ` : ""}

          ${mentions.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h2 style="color: #374151; font-size: 18px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e5e7eb;">
                @️ Mentions (${mentions.length})
              </h2>
              ${mentions.slice(0, 5).map((notif) => `
                <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                  <p style="margin: 0 0 8px 0; color: #1f2937; font-weight: 600;">${notif.title}</p>
                  <p style="margin: 0 0 8px 0; color: #4b5563; font-size: 14px;">${notif.message}</p>
                  <p style="margin: 0; color: #9ca3af; font-size: 12px;">${format(new Date(notif.created_at), "MMM d, yyyy 'at' h:mm a")}</p>
                </div>
              `).join("")}
              ${mentions.length > 5 ? `<p style="color: #6b7280; font-size: 14px; text-align: center; margin: 10px 0;">And ${mentions.length - 5} more...</p>` : ""}
            </div>
          ` : ""}

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 15px 0;">
              You're receiving ${frequencyText.toLowerCase()} digests at ${timeStr}
            </p>
            <a href="#" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">
              View All Discussions
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
              <a href="#" style="color: #3b82f6; text-decoration: none; margin-right: 15px;">
                Manage Email Preferences
              </a>
              <span style="color: #d1d5db;">|</span>
              <a href="#" style="color: #9ca3af; text-decoration: none; margin-left: 15px;">
                Unsubscribe from Digests
              </a>
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">
              your-email@example.com
            </p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              This is a preview of your ${frequencyText.toLowerCase()} digest email
            </p>
          </div>
        </div>
      </div>
    `;
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      fetchPreviewData();
    } else {
      setPreviewHtml("");
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Digest Preview
          </DialogTitle>
          <DialogDescription>
            This is how your {frequency} digest email will appear based on your recent notifications
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : previewHtml ? (
          <div className="border rounded-lg overflow-hidden">
            <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notifications to preview</p>
            <p className="text-sm mt-2">Participate in discussions to see your digest preview</p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={fetchPreviewData} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Refresh Preview"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
