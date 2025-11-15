import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Mail, CheckCircle, AlertCircle, Calendar, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface CampaignStats {
  totalCampaigns: number;
  pendingCampaigns: number;
  scheduledCampaigns: number;
  sentCampaigns: number;
  failedCampaigns: number;
  totalEmailsSent: number;
  avgEmailsPerCampaign: number;
  recurringCampaigns: number;
  oneTimeCampaigns: number;
}

interface CampaignPerformance {
  id: string;
  subject: string;
  sent_count: number;
  open_rate: number;
  click_rate: number;
  redemption_rate: number;
  status: string;
  last_sent_at: string;
}

interface TrendData {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "hsl(var(--muted))"];

const CampaignAnalytics = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [performance, setPerformance] = useState<CampaignPerformance[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch campaign statistics
      const { data: campaigns, error: campaignsError } = await (supabase as any)
        .from("scheduled_voucher_campaigns")
        .select("*");

      if (campaignsError) throw campaignsError;

      // Fetch email distributions
      const { data: distributions, error: distError } = await (supabase as any)
        .from("voucher_distributions")
        .select("*");

      if (distError) throw distError;

      // Fetch email engagement data
      const { data: emailSends, error: sendsError } = await (supabase as any)
        .from("email_sends")
        .select("*");

      if (sendsError) throw sendsError;

      // Fetch voucher usage
      const { data: voucherUsage, error: usageError } = await (supabase as any)
        .from("voucher_usage")
        .select("*");

      if (usageError) throw usageError;

      // Calculate overall stats
      const totalCampaigns = campaigns?.length || 0;
      const pendingCampaigns = campaigns?.filter((c: any) => c.status === "pending").length || 0;
      const scheduledCampaigns = campaigns?.filter((c: any) => c.status === "scheduled").length || 0;
      const sentCampaigns = campaigns?.filter((c: any) => c.status === "sent").length || 0;
      const failedCampaigns = campaigns?.filter((c: any) => c.status === "failed").length || 0;
      const totalEmailsSent = distributions?.length || 0;
      const recurringCampaigns = campaigns?.filter((c: any) => c.recurrence_type !== "none").length || 0;
      const oneTimeCampaigns = campaigns?.filter((c: any) => c.recurrence_type === "none").length || 0;

      setStats({
        totalCampaigns,
        pendingCampaigns,
        scheduledCampaigns,
        sentCampaigns,
        failedCampaigns,
        totalEmailsSent,
        avgEmailsPerCampaign: sentCampaigns > 0 ? Math.round(totalEmailsSent / sentCampaigns) : 0,
        recurringCampaigns,
        oneTimeCampaigns,
      });

      // Calculate performance per campaign
      const performanceData = campaigns?.map((campaign: any) => {
        const campaignDists = distributions?.filter((d: any) => d.campaign_id === campaign.id) || [];
        const sentCount = campaignDists.length;

        // Get email engagement for this campaign's distributions
        const campaignEmails = emailSends?.filter((e: any) =>
          campaignDists.some((d: any) => d.email === e.email)
        ) || [];

        const openedCount = campaignEmails.filter((e: any) => e.opened_at).length;
        const clickedCount = campaignEmails.filter((e: any) => e.clicked_at).length;

        // Get redemptions for vouchers distributed in this campaign
        const redemptionCount = voucherUsage?.filter((u: any) =>
          u.voucher_id === campaign.voucher_id
        ).length || 0;

        return {
          id: campaign.id,
          subject: campaign.subject,
          sent_count: sentCount,
          open_rate: sentCount > 0 ? ((openedCount / sentCount) * 100).toFixed(1) : 0,
          click_rate: sentCount > 0 ? ((clickedCount / sentCount) * 100).toFixed(1) : 0,
          redemption_rate: sentCount > 0 ? ((redemptionCount / sentCount) * 100).toFixed(1) : 0,
          status: campaign.status,
          last_sent_at: campaign.last_sent_at,
        };
      }).filter((p: any) => p.sent_count > 0) || [];

      setPerformance(performanceData);

      // Calculate trends (last 30 days)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const trendMap = new Map<string, { sent: number; opened: number; clicked: number }>();
      
      distributions?.forEach((dist: any) => {
        const date = format(new Date(dist.sent_at), "MMM dd");
        const distDate = new Date(dist.sent_at);
        
        if (distDate >= thirtyDaysAgo) {
          if (!trendMap.has(date)) {
            trendMap.set(date, { sent: 0, opened: 0, clicked: 0 });
          }
          const trend = trendMap.get(date)!;
          trend.sent += 1;

          // Check if this email was opened/clicked
          const emailData = emailSends?.find((e: any) => e.email === dist.email);
          if (emailData?.opened_at) trend.opened += 1;
          if (emailData?.clicked_at) trend.clicked += 1;
        }
      });

      const trendsData = Array.from(trendMap.entries()).map(([date, data]) => ({
        date,
        ...data,
      }));

      setTrends(trendsData);

    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load campaign analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout
        title="Campaign Analytics"
        description="Track voucher campaign performance and engagement"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </AdminLayout>
    );
  }

  const statusDistribution = [
    { name: "Pending", value: stats?.pendingCampaigns || 0 },
    { name: "Scheduled", value: stats?.scheduledCampaigns || 0 },
    { name: "Sent", value: stats?.sentCampaigns || 0 },
    { name: "Failed", value: stats?.failedCampaigns || 0 },
  ].filter((d) => d.value > 0);

  const campaignTypeDistribution = [
    { name: "One-Time", value: stats?.oneTimeCampaigns || 0 },
    { name: "Recurring", value: stats?.recurringCampaigns || 0 },
  ].filter((d) => d.value > 0);

  return (
    <AdminLayout
      title="Campaign Analytics"
      description="Track voucher campaign performance and engagement"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.scheduledCampaigns} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEmailsSent}</div>
              <p className="text-xs text-muted-foreground">
                Avg {stats?.avgEmailsPerCampaign} per campaign
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.sentCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.recurringCampaigns} recurring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.failedCampaigns} failed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="trends" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Activity (Last 30 Days)</CardTitle>
                <CardDescription>Sent, opened, and clicked emails over time</CardDescription>
              </CardHeader>
              <CardContent>
                {trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="sent" stroke="hsl(var(--primary))" name="Sent" />
                      <Line type="monotone" dataKey="opened" stroke="hsl(var(--secondary))" name="Opened" />
                      <Line type="monotone" dataKey="clicked" stroke="hsl(var(--accent))" name="Clicked" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No trend data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Engagement metrics for sent campaigns</CardDescription>
              </CardHeader>
              <CardContent>
                {performance.length > 0 ? (
                  <div className="space-y-4">
                    {performance.slice(0, 10).map((campaign) => (
                      <div key={campaign.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{campaign.subject}</h4>
                          <Badge variant="secondary">{campaign.status}</Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Sent</p>
                            <p className="font-semibold">{campaign.sent_count}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Open Rate</p>
                            <p className="font-semibold">{campaign.open_rate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Click Rate</p>
                            <p className="font-semibold">{campaign.click_rate}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Redemptions</p>
                            <p className="font-semibold">{campaign.redemption_rate}%</p>
                          </div>
                        </div>
                        {campaign.last_sent_at && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Last sent: {format(new Date(campaign.last_sent_at), "PPp")}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No performance data available yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Status</CardTitle>
                  <CardDescription>Distribution by current status</CardDescription>
                </CardHeader>
                <CardContent>
                  {statusDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No campaigns yet
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campaign Type</CardTitle>
                  <CardDescription>One-time vs recurring campaigns</CardDescription>
                </CardHeader>
                <CardContent>
                  {campaignTypeDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={campaignTypeDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No campaigns yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
    </AdminLayout>
  );
};

export default CampaignAnalytics;
