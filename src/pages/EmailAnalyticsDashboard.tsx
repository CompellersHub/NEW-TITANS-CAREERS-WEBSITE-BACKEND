import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLayout } from "@/components/layouts/PageLayout";
import { Mail, TrendingUp, Users, MousePointerClick, Loader2, Inbox } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { DataFetchError } from "@/components/error/DataFetchError";
import { CampaignAnalyticsSkeleton } from "@/components/skeletons/CampaignAnalyticsSkeleton";
import { EmptyState } from "@/components/error/EmptyState";

interface CampaignStats {
  totalCampaigns: number;
  totalSent: number;
  avgOpenRate: number;
  avgClickRate: number;
  activeSubscribers: number;
}

interface Campaign {
  id: string;
  subject: string;
  campaign_type: string;
  sent_at: string;
  recipient_count: number;
  success_count: number;
}

interface TrendData {
  date: string;
  openRate: number;
  clickRate: number;
  sends: number;
}

export default function EmailAnalyticsDashboard() {
  const [stats, setStats] = useState<CampaignStats>({
    totalCampaigns: 0,
    totalSent: 0,
    avgOpenRate: 0,
    avgClickRate: 0,
    activeSubscribers: 0,
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retrying, setRetrying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch campaign data
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("email_campaigns")
        .select("*")
        .order("sent_at", { ascending: false });

      if (campaignsError) throw campaignsError;

      // Fetch subscriber count
      const { count: subscriberCount, error: subscriberError } = await supabase
        .from("newsletter_subscribers")
        .select("*", { count: "exact", head: true })
        .eq("active", true);

      if (subscriberError) throw subscriberError;

      // Fetch engagement events
      const { data: engagementData, error: engagementError } = await supabase
        .from("engagement_events")
        .select("event_type, created_at, campaign_id");

      if (engagementError) throw engagementError;

      // Calculate stats
      const totalSent = campaignsData?.reduce((sum, c) => sum + (c.recipient_count || 0), 0) || 0;
      const totalOpens = engagementData?.filter(e => e.event_type === "open").length || 0;
      const totalClicks = engagementData?.filter(e => e.event_type === "click").length || 0;

      const avgOpenRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
      const avgClickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;

      setStats({
        totalCampaigns: campaignsData?.length || 0,
        totalSent,
        avgOpenRate: Number(avgOpenRate.toFixed(2)),
        avgClickRate: Number(avgClickRate.toFixed(2)),
        activeSubscribers: subscriberCount || 0,
      });

      setCampaigns(campaignsData as Campaign[] || []);

      // Calculate trend data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trendMap = new Map<string, { opens: number; clicks: number; sends: number }>();

      // Initialize last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        trendMap.set(dateStr, { opens: 0, clicks: 0, sends: 0 });
      }

      // Count sends per day
      campaignsData?.forEach(campaign => {
        const dateStr = campaign.sent_at.split('T')[0];
        const existing = trendMap.get(dateStr);
        if (existing) {
          existing.sends += campaign.recipient_count || 0;
        }
      });

      // Count engagement per day
      engagementData?.forEach(event => {
        const dateStr = event.created_at.split('T')[0];
        const existing = trendMap.get(dateStr);
        if (existing) {
          if (event.event_type === "open") existing.opens++;
          if (event.event_type === "click") existing.clicks++;
        }
      });

      // Convert to array and calculate rates
      const trends: TrendData[] = Array.from(trendMap.entries())
        .map(([date, data]) => ({
          date,
          openRate: data.sends > 0 ? Number(((data.opens / data.sends) * 100).toFixed(2)) : 0,
          clickRate: data.sends > 0 ? Number(((data.clicks / data.sends) * 100).toFixed(2)) : 0,
          sends: data.sends,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      setTrendData(trends);
    } catch (error: any) {
      console.error("Error loading analytics:", error);
      setError(error);
      if (!retrying) {
        toast({
          title: "Error",
          description: "Failed to load analytics data",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    await loadAnalytics();
  };

  if (error && !loading) {
    return (
      <ErrorBoundary onReset={handleRetry}>
        <PageLayout intensity3D="subtle" show3D={true}>
          <main className="flex-1 flex items-center justify-center">
            <DataFetchError
              title="Failed to Load Campaign Analytics"
              description="We couldn't fetch your email campaign data. This might be a temporary connection issue."
              error={error}
              onRetry={handleRetry}
              retrying={retrying}
            />
          </main>
        </PageLayout>
      </ErrorBoundary>
    );
  }

  if (loading) {
    return <CampaignAnalyticsSkeleton />;
  }

  return (
    <ErrorBoundary onReset={loadAnalytics}>
      <PageLayout intensity3D="subtle" show3D={true}>
        <main className="container mx-auto px-4 py-8 bg-gradient-to-br from-background via-background to-primary/5 animate-fade-in">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-kanit font-bold mb-2">Email Campaign Analytics</h1>
          <p className="text-muted-foreground">Monitor your email marketing performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total deliveries</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgOpenRate}%</div>
              <p className="text-xs text-muted-foreground">Across all campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Click Rate</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgClickRate}%</div>
              <p className="text-xs text-muted-foreground">Click-through rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Engagement Trends Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Engagement Trends (Last 30 Days)</CardTitle>
            <CardDescription>Open and click rates over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="openRate" 
                  stroke="hsl(var(--primary))" 
                  name="Open Rate (%)"
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="clickRate" 
                  stroke="hsl(var(--accent))" 
                  name="Click Rate (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Volume Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Email Volume (Last 30 Days)</CardTitle>
            <CardDescription>Number of emails sent per day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis label={{ value: 'Emails Sent', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                />
                <Bar dataKey="sends" fill="hsl(var(--primary))" name="Emails Sent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Latest email campaigns sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.slice(0, 10).map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <h4 className="font-medium">{campaign.subject}</h4>
                    <p className="text-sm text-muted-foreground">
                      {campaign.campaign_type} • {new Date(campaign.sent_at).toLocaleDateString('en-US', { 
                        month: 'long', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{campaign.recipient_count.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">recipients</p>
                  </div>
                </div>
              ))}
              {campaigns.length === 0 && (
                <EmptyState
                  icon={Inbox}
                  title="No Campaigns Sent"
                  description="Your campaign history will appear here once you start sending emails to your subscribers."
                >
                  <div className="text-sm text-muted-foreground space-y-2 text-left">
                    <p className="font-semibold">Campaign features include:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Newsletter broadcasts</li>
                      <li>Automated digest emails</li>
                      <li>Discussion notifications</li>
                      <li>Targeted campaigns</li>
                    </ul>
                  </div>
                </EmptyState>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscriber Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Subscribers
            </CardTitle>
            <CardDescription>Total active newsletter subscribers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.activeSubscribers.toLocaleString()}</div>
          </CardContent>
        </Card>
      </main>
      </PageLayout>
    </ErrorBoundary>
  );
}
