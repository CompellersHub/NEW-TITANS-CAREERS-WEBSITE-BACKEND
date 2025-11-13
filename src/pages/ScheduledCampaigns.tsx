import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Calendar, Clock, Repeat, Trash2, Play, Pause, BarChart3 } from "lucide-react";
import { format } from "date-fns";

const ScheduledCampaigns = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("scheduled_voucher_campaigns")
        .select(`
          *,
          vouchers (code, discount_value, discount_type),
          subscriber_segments (name)
        `)
        .order("next_send_at", { ascending: true });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to load scheduled campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCampaign = async (campaignId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("scheduled_voucher_campaigns")
        .update({ status: "cancelled" })
        .eq("id", campaignId);

      if (error) throw error;

      toast({
        title: "Campaign Cancelled",
        description: "The scheduled campaign has been cancelled",
      });

      fetchCampaigns();
    } catch (error: any) {
      console.error("Error cancelling campaign:", error);
      toast({
        title: "Error",
        description: "Failed to cancel campaign",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("scheduled_voucher_campaigns")
        .delete()
        .eq("id", campaignId);

      if (error) throw error;

      toast({
        title: "Campaign Deleted",
        description: "The campaign has been permanently deleted",
      });

      fetchCampaigns();
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      toast({
        title: "Error",
        description: "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  const handleReactivateCampaign = async (campaignId: string) => {
    try {
      const { error } = await (supabase as any)
        .from("scheduled_voucher_campaigns")
        .update({ status: "scheduled" })
        .eq("id", campaignId);

      if (error) throw error;

      toast({
        title: "Campaign Reactivated",
        description: "The campaign has been reactivated",
      });

      fetchCampaigns();
    } catch (error: any) {
      console.error("Error reactivating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to reactivate campaign",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "outline";
      case "scheduled":
        return "default";
      case "sent":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "rejected":
        return "destructive";
      case "failed":
        return "destructive";
      default:
        return "default";
    }
  };

  const getRecurrenceLabel = (type: string) => {
    switch (type) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      default:
        return "One-time";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/admin/vouchers")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Vouchers
            </Button>
            <h1 className="text-3xl font-bold">Scheduled Campaigns</h1>
          </div>
          <Button onClick={() => navigate("/admin/vouchers/campaign-analytics")}>
            <BarChart3 className="mr-2 h-4 w-4" />
            View Analytics
          </Button>
        </div>
        <div className="text-center py-12">Loading campaigns...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/voucher-manager")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Scheduled Campaigns</h1>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/campaign-approval")}>
          <Clock className="h-4 w-4 mr-2" />
          Approval Queue
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No scheduled campaigns yet</p>
              <p className="text-sm mt-2">Schedule campaigns from the Voucher Manager</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {campaign.vouchers?.code}
                      <Badge variant={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      {campaign.recurrence_type !== "none" && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Repeat className="h-3 w-3" />
                          {getRecurrenceLabel(campaign.recurrence_type)}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{campaign.subject}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {campaign.status === "scheduled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelCampaign(campaign.id)}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                    {campaign.status === "cancelled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReactivateCampaign(campaign.id)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Reactivate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCampaign(campaign.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3" />
                      Next Send
                    </div>
                    <div className="font-medium">
                      {campaign.next_send_at
                        ? format(new Date(campaign.next_send_at), "MMM d, yyyy")
                        : "N/A"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {campaign.next_send_at
                        ? format(new Date(campaign.next_send_at), "h:mm a")
                        : ""}
                    </div>
                  </div>

                  {campaign.last_sent_at && (
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1 mb-1">
                        <Clock className="h-3 w-3" />
                        Last Sent
                      </div>
                      <div className="font-medium">
                        {format(new Date(campaign.last_sent_at), "MMM d, yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(campaign.last_sent_at), "h:mm a")}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-muted-foreground mb-1">Recipients</div>
                    <div className="font-medium">
                      {campaign.subscriber_segments
                        ? campaign.subscriber_segments.name
                        : `${campaign.manual_emails?.length || 0} manual`}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground mb-1">Voucher</div>
                    <div className="font-medium">
                      {campaign.vouchers?.discount_type === "percentage"
                        ? `${campaign.vouchers.discount_value}% OFF`
                        : `$${campaign.vouchers.discount_value} OFF`}
                    </div>
                  </div>
                </div>

                {campaign.message && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">Custom Message</div>
                    <div className="text-sm">{campaign.message}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduledCampaigns;
