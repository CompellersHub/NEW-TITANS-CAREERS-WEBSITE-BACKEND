import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Users } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface EmailDistributionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  voucherId: string;
  voucherCode: string;
}

export function EmailDistributionDialog({
  open,
  onOpenChange,
  voucherId,
  voucherCode,
}: EmailDistributionDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [distributionMethod, setDistributionMethod] = useState<"manual" | "segment">("manual");
  const [emailList, setEmailList] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [segments, setSegments] = useState<any[]>([]);
  const [subject, setSubject] = useState(`Your Exclusive Voucher: ${voucherCode}`);
  const [message, setMessage] = useState("");
  const [recipientCount, setRecipientCount] = useState(0);

  useEffect(() => {
    if (open) {
      fetchSegments();
    }
  }, [open]);

  useEffect(() => {
    if (distributionMethod === "manual") {
      const emails = emailList
        .split(/[\n,;]/)
        .map((e) => e.trim())
        .filter((e) => e && e.includes("@"));
      setRecipientCount(emails.length);
    } else if (selectedSegment) {
      fetchSegmentCount();
    }
  }, [distributionMethod, emailList, selectedSegment]);

  const fetchSegments = async () => {
    const { data } = await supabase
      .from("subscriber_segments")
      .select("*")
      .order("name");

    if (data) {
      setSegments(data);
    }
  };

  const fetchSegmentCount = async () => {
    if (!selectedSegment) {
      setRecipientCount(0);
      return;
    }

    const { data, error } = await supabase.rpc("get_segment_count", {
      segment_id: selectedSegment,
    });

    if (!error && data !== null) {
      setRecipientCount(data);
    }
  };

  const handleSend = async () => {
    setLoading(true);

    try {
      const recipients =
        distributionMethod === "manual"
          ? emailList
              .split(/[\n,;]/)
              .map((e) => e.trim())
              .filter((e) => e && e.includes("@"))
          : [];

      if (recipients.length === 0 && !selectedSegment) {
        toast({
          title: "Error",
          description: "Please provide recipients or select a segment",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "send-voucher-email",
        {
          body: {
            voucherId,
            recipients,
            segmentId: distributionMethod === "segment" ? selectedSegment : null,
            subject,
            message,
          },
        }
      );

      if (error) throw error;

      toast({
        title: "Emails Sent Successfully",
        description: `Voucher sent to ${data.totalSent} recipient(s)`,
      });

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error("Error sending emails:", error);
      toast({
        title: "Error Sending Emails",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmailList("");
    setSelectedSegment("");
    setSubject(`Your Exclusive Voucher: ${voucherCode}`);
    setMessage("");
    setRecipientCount(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send Voucher via Email</DialogTitle>
          <DialogDescription>
            Distribute voucher code <span className="font-mono font-semibold">{voucherCode}</span> to
            your audience
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>Distribution Method</Label>
            <RadioGroup
              value={distributionMethod}
              onValueChange={(value: any) => setDistributionMethod(value)}
            >
              <div className="flex items-center space-x-2 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="manual" id="manual" />
                <Label
                  htmlFor="manual"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Manual Email List</div>
                    <div className="text-sm text-muted-foreground">
                      Enter specific email addresses
                    </div>
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="segment" id="segment" />
                <Label
                  htmlFor="segment"
                  className="flex items-center gap-2 cursor-pointer flex-1"
                >
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Newsletter Segment</div>
                    <div className="text-sm text-muted-foreground">
                      Send to existing subscriber segments
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {distributionMethod === "manual" ? (
            <div className="space-y-2">
              <Label htmlFor="emails">Email Addresses</Label>
              <Textarea
                id="emails"
                placeholder="Enter email addresses (one per line, or comma/semicolon separated)"
                value={emailList}
                onChange={(e) => setEmailList(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                {recipientCount} valid email{recipientCount !== 1 ? "s" : ""} detected
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="segment">Select Segment</Label>
              <Select value={selectedSegment} onValueChange={setSelectedSegment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subscriber segment" />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((segment) => (
                    <SelectItem key={segment.id} value={segment.id}>
                      {segment.name} ({segment.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSegment && (
                <p className="text-sm text-muted-foreground">
                  This segment contains {recipientCount} active subscriber{recipientCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a personal message to include in the email"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              This message will appear before the voucher details
            </p>
          </div>

          {recipientCount > 0 && (
            <div className="bg-accent/50 border border-border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium">Ready to Send</p>
                  <p className="text-sm text-muted-foreground">
                    This voucher will be sent to <span className="font-semibold">{recipientCount}</span>{" "}
                    recipient{recipientCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading || recipientCount === 0}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Send to {recipientCount} Recipient{recipientCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
