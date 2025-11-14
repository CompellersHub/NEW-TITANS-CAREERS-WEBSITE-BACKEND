import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle, XCircle, Clock, Calendar, Users, Mail, Package, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PendingCampaign {
  id: string;
  subject: string;
  message: string | null;
  scheduled_time: string;
  recurrence_type: string;
  status: string;
  created_at: string;
  voucher_id: string;
  segment_id: string | null;
  manual_emails: string[] | null;
  vouchers?: {
    code: string;
    discount_type: string;
    discount_value: number;
  };
  subscriber_segments?: {
    name: string;
    subscriber_count: number;
  };
}

export default function CampaignApprovalQueue() {
  const [pendingCampaigns, setPendingCampaigns] = useState<PendingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPendingCampaigns();
  }, []);

  const fetchPendingCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("scheduled_voucher_campaigns")
        .select(`
          *,
          vouchers:voucher_id (code, discount_type, discount_value),
          subscriber_segments:segment_id (name, subscriber_count)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingCampaigns(data || []);
    } catch (error: any) {
      console.error("Error fetching pending campaigns:", error);
      toast.error("Failed to load pending campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (campaignId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await (supabase as any)
        .from("scheduled_voucher_campaigns")
        .update({
          status: "scheduled",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", campaignId);

      if (error) throw error;

      toast.success("Campaign approved and scheduled successfully");
      fetchPendingCampaigns();
    } catch (error: any) {
      console.error("Error approving campaign:", error);
      toast.error("Failed to approve campaign");
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await (supabase as any)
        .from("scheduled_voucher_campaigns")
        .update({
          status: "rejected",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq("id", rejectingId);

      if (error) throw error;

      toast.success("Campaign rejected");
      setRejectingId(null);
      setRejectionReason("");
      fetchPendingCampaigns();
    } catch (error: any) {
      console.error("Error rejecting campaign:", error);
      toast.error("Failed to reject campaign");
    }
  };

  const getRecurrenceLabel = (type: string) => {
    const labels: Record<string, string> = {
      none: "One-time",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
    };
    return labels[type] || type;
  };

  const getRecipientCount = (campaign: PendingCampaign) => {
    if (campaign.manual_emails && campaign.manual_emails.length > 0) {
      return campaign.manual_emails.length;
    }
    return campaign.subscriber_segments?.subscriber_count || 0;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-muted/20">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-accent/10 rounded-xl">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Campaign Approval Queue</h1>
              <p className="text-muted-foreground mt-1">
                Review and approve pending voucher campaigns before they are scheduled
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {!loading && (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card className="border-accent/20 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Pending Review</CardDescription>
                <CardTitle className="text-3xl font-bold text-accent">{pendingCampaigns.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Campaigns awaiting approval</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Total Recipients</CardDescription>
                <CardTitle className="text-3xl font-bold text-foreground">
                  {pendingCampaigns.reduce((sum, c) => sum + getRecipientCount(c), 0)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Users awaiting campaigns</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardDescription className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Recurring Campaigns</CardDescription>
                <CardTitle className="text-3xl font-bold text-foreground">
                  {pendingCampaigns.filter(c => c.recurrence_type !== 'none').length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Auto-recurring schedules</p>
              </CardContent>
            </Card>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : pendingCampaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Pending Campaigns</h3>
              <p className="text-muted-foreground text-center">
                All campaigns have been reviewed. Check back later for new submissions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingCampaigns.map((campaign) => (
              <Card key={campaign.id} className="border-2 border-yellow-500/20">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{campaign.subject}</CardTitle>
                    <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {campaign.message || "No additional message"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(campaign.scheduled_time), "PPp")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{getRecipientCount(campaign)} recipients</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{getRecurrenceLabel(campaign.recurrence_type)}</span>
                    </div>

                    {campaign.vouchers && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="font-medium text-sm mb-1">Voucher Details:</p>
                        <p className="text-xs text-muted-foreground">
                          Code: <span className="font-mono font-semibold">{campaign.vouchers.code}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.vouchers.discount_type === "percentage" ? (
                            `${campaign.vouchers.discount_value}% off`
                          ) : (
                            `$${campaign.vouchers.discount_value} off`
                          )}
                        </p>
                      </div>
                    )}

                    {campaign.subscriber_segments && (
                      <div className="text-xs text-muted-foreground">
                        Segment: <span className="font-medium">{campaign.subscriber_segments.name}</span>
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      Submitted: {format(new Date(campaign.created_at), "PP")}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => handleApprove(campaign.id)}
                      className="flex-1"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => setRejectingId(campaign.id)}
                      variant="destructive"
                      className="flex-1"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!rejectingId} onOpenChange={() => setRejectingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Campaign</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this campaign. This will help the creator understand what needs to be changed.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setRejectingId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
