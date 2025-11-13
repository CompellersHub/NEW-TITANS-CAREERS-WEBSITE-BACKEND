import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Repeat, Send, X } from "lucide-react";

interface ScheduledCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucherId: string;
  voucherCode?: string;
}

export const ScheduledCampaignDialog = ({
  open,
  onOpenChange,
  voucherId,
  voucherCode,
}: ScheduledCampaignDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [segments, setSegments] = useState<any[]>([]);
  const [recipientType, setRecipientType] = useState<"segment" | "manual">("segment");
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [manualEmails, setManualEmails] = useState("");
  const [subject, setSubject] = useState(`Your Exclusive Voucher: ${voucherCode || ""}`);
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<"none" | "daily" | "weekly" | "monthly">("none");
  const [recipientCount, setRecipientCount] = useState(0);
  const [requiresApproval, setRequiresApproval] = useState(false);

  useEffect(() => {
    if (open) {
      fetchSegments();
      // Set default to tomorrow at 9 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      setScheduledDate(tomorrow.toISOString().split('T')[0]);
      setScheduledTime("09:00");
    }
  }, [open]);

  useEffect(() => {
    calculateRecipientCount();
  }, [recipientType, selectedSegment, manualEmails, segments]);

  const fetchSegments = async () => {
    const { data, error } = await supabase
      .from("subscriber_segments")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching segments:", error);
      return;
    }

    setSegments(data || []);
  };

  const calculateRecipientCount = async () => {
    if (recipientType === "manual") {
      const emails = manualEmails.split(",").map(e => e.trim()).filter(e => e);
      setRecipientCount(emails.length);
    } else if (selectedSegment) {
      const segment = segments.find(s => s.id === selectedSegment);
      if (segment) {
        const { data: subscribers } = await supabase
          .from("newsletter_subscribers")
          .select("email", { count: "exact" })
          .eq("active", true);

        if (subscribers) {
          const filtered = subscribers.filter((sub: any) => {
            const hasRequiredTags = segment.tags_include.length === 0 || 
              segment.tags_include.some((tag: string) => sub.tags?.includes(tag));
            const hasNoExcludedTags = segment.tags_exclude.length === 0 || 
              !segment.tags_exclude.some((tag: string) => sub.tags?.includes(tag));
            return hasRequiredTags && hasNoExcludedTags;
          });
          setRecipientCount(filtered.length);
        }
      }
    } else {
      setRecipientCount(0);
    }
  };

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast({
        title: "Error",
        description: "Please select a date and time",
        variant: "destructive",
      });
      return;
    }

    if (recipientType === "segment" && !selectedSegment) {
      toast({
        title: "Error",
        description: "Please select a segment",
        variant: "destructive",
      });
      return;
    }

    if (recipientType === "manual" && !manualEmails.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

      const campaignData: any = {
        voucher_id: voucherId,
        subject,
        message: message || null,
        scheduled_time: scheduledDateTime.toISOString(),
        recurrence_type: recurrenceType,
      };

      if (recipientType === "segment") {
        campaignData.segment_id = selectedSegment;
        campaignData.manual_emails = [];
      } else {
        campaignData.manual_emails = manualEmails.split(",").map(e => e.trim()).filter(e => e);
        campaignData.segment_id = null;
      }

      // Set status based on approval requirement
      const { data: { user } } = await supabase.auth.getUser();
      campaignData.status = requiresApproval ? "pending" : "scheduled";
      campaignData.created_by = user?.id;

      const { error } = await (supabase as any)
        .from("scheduled_voucher_campaigns")
        .insert(campaignData);

      if (error) throw error;

      // Send approval notification if campaign requires approval
      if (requiresApproval) {
        try {
          // Get voucher details for notification
          const { data: voucherData } = await (supabase as any)
            .from("vouchers")
            .select("code")
            .eq("id", voucherId)
            .single();

          await supabase.functions.invoke("send-campaign-approval-notification", {
            body: {
              campaignId: voucherId,
              campaignSubject: subject,
              recipientCount,
              scheduledTime: scheduledDateTime.toISOString(),
              voucherCode: voucherData?.code || voucherCode || "N/A",
              submitterEmail: user?.email,
            },
          });

          console.log("Approval notification sent to admins");
        } catch (notificationError) {
          console.error("Failed to send approval notification:", notificationError);
          // Don't fail the whole operation if notification fails
        }
      }

      toast({
        title: requiresApproval ? "Campaign Submitted for Approval" : "Campaign Scheduled",
        description: requiresApproval 
          ? "Campaign submitted and admins have been notified for approval"
          : `Voucher campaign scheduled for ${scheduledDateTime.toLocaleString()}`,
      });

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Error scheduling campaign:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule campaign",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRecipientType("segment");
    setSelectedSegment("");
    setManualEmails("");
    setMessage("");
    setRecurrenceType("none");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Voucher Campaign
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduled-date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="scheduled-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="scheduled-time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time
              </Label>
              <Input
                id="scheduled-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="recurrence" className="flex items-center gap-2">
              <Repeat className="h-4 w-4" />
              Recurrence
            </Label>
            <Select value={recurrenceType} onValueChange={(value: any) => setRecurrenceType(value)}>
              <SelectTrigger id="recurrence">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">One-time</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            {recurrenceType !== "none" && (
              <p className="text-sm text-muted-foreground mt-1">
                Campaign will repeat {recurrenceType} starting from the scheduled date
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2 pb-2 border-b">
            <input
              type="checkbox"
              id="requiresApproval"
              checked={requiresApproval}
              onChange={(e) => setRequiresApproval(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 cursor-pointer"
            />
            <Label htmlFor="requiresApproval" className="text-sm font-normal cursor-pointer">
              Require approval before scheduling (campaign will be pending)
            </Label>
          </div>

          <div>
            <Label>Recipients</Label>
            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                variant={recipientType === "segment" ? "default" : "outline"}
                onClick={() => setRecipientType("segment")}
                className="flex-1"
              >
                Segment
              </Button>
              <Button
                type="button"
                variant={recipientType === "manual" ? "default" : "outline"}
                onClick={() => setRecipientType("manual")}
                className="flex-1"
              >
                Manual Emails
              </Button>
            </div>
          </div>

          {recipientType === "segment" ? (
            <div>
              <Label htmlFor="segment">Select Segment</Label>
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger id="segment">
                  <SelectValue placeholder="Choose a segment" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id}>
                      {segment.name} ({segment.subscriber_count || 0} subscribers)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <Label htmlFor="manual-emails">Email Addresses (comma-separated)</Label>
              <Textarea
                id="manual-emails"
                placeholder="user1@example.com, user2@example.com"
                value={manualEmails}
                onChange={(e) => setManualEmails(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {recipientCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {recipientCount} recipient{recipientCount !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}

          <div>
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Your Exclusive Voucher"
            />
          </div>

          <div>
            <Label htmlFor="message">Custom Message (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a personalized message to include in the email"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={loading || recipientCount === 0}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Scheduling..." : "Schedule Campaign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
