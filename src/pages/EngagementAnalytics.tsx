import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const sb: any = supabase;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, MousePointer, Users, Mail, Award, Inbox } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { AnalyticsDashboardSkeleton } from "@/components/skeletons/AnalyticsDashboardSkeleton";
import { EmptyState } from "@/components/error/EmptyState";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface EngagementMetrics {
  totalOpens: number;
  totalClicks: number;
  avgLeadScore: number;
  activeSubscribers: number;
  openRate: number;
  clickRate: number;
}

interface TimeSeriesData {
  date: string;
  opens: number;
  clicks: number;
}

interface TopPerformer {
  email: string;
  name: string | null;
  total_score: number;
  status: string;
  total_opens: number;
  total_clicks: number;
}

interface LeadScoreDistribution {
  range: string;
  count: number;
  fill: string;
}

export default function EngagementAnalytics() {
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<LeadScoreDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const startDate = startOfDay(subDays(new Date(), timeRange));
      const endDate = endOfDay(new Date());

      // Fetch overall metrics
      await fetchMetrics(startDate, endDate);
      
      // Fetch time series data
      await fetchTimeSeriesData(startDate, endDate);
      
      // Fetch top performers
      await fetchTopPerformers();
      
      // Fetch score distribution
      await fetchScoreDistribution();
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async (startDate: Date, endDate: Date) => {
    try {
      const { data: events } = await sb
        .from("engagement_events")
        .select("event_type")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString()) as any;

      const { data: subscribers } = await sb
        .from("newsletter_subscribers")
        .select("engagement_score, active")
        .eq("active", true) as any;

      const { data: sends } = await sb
        .from("email_sends")
        .select("opened_at, clicked_at")
        .gte("sent_at", startDate.toISOString())
        .lte("sent_at", endDate.toISOString()) as any;

      const totalOpens = events?.filter((e: any) => e.event_type === "open").length || 0;
      const totalClicks = events?.filter((e: any) => e.event_type === "click").length || 0;
      const avgLeadScore = subscribers?.reduce((sum: number, s: any) => sum + (s.engagement_score || 0), 0) / (subscribers?.length || 1);
      const activeSubscribers = subscribers?.length || 0;
      const totalSends = sends?.length || 1;
      const openRate = ((sends?.filter((s: any) => s.opened_at).length || 0) / totalSends) * 100;
      const clickRate = ((sends?.filter((s: any) => s.clicked_at).length || 0) / totalSends) * 100;

      setMetrics({
        totalOpens,
        totalClicks,
        avgLeadScore: Math.round(avgLeadScore),
        activeSubscribers,
        openRate: Math.round(openRate),
        clickRate: Math.round(clickRate),
      });
    } catch (error) {
      console.error("Error fetching metrics:", error);
    }
  };

  const fetchTimeSeriesData = async (startDate: Date, endDate: Date) => {
    try {
      const { data: events } = await supabase
        .from("engagement_events")
        .select("event_type, created_at")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .order("created_at", { ascending: true }) as any;

      // Group by date
      const groupedData = new Map<string, { opens: number; clicks: number }>();
      
      for (let i = 0; i <= timeRange; i++) {
        const date = format(subDays(new Date(), timeRange - i), "MMM dd");
        groupedData.set(date, { opens: 0, clicks: 0 });
      }

      events?.forEach((event: any) => {
        const date = format(new Date(event.created_at), "MMM dd");
        const existing = groupedData.get(date) || { opens: 0, clicks: 0 };
        if (event.event_type === "open") {
          existing.opens++;
        } else if (event.event_type === "click") {
          existing.clicks++;
        }
        groupedData.set(date, existing);
      });

      const chartData = Array.from(groupedData.entries()).map(([date, values]) => ({
        date,
        ...values,
      }));

      setTimeSeriesData(chartData);
    } catch (error) {
      console.error("Error fetching time series:", error);
    }
  };

  const fetchTopPerformers = async () => {
    try {
      const { data } = await sb
        .from("lead_scores")
        .select("email, name, total_score, status")
        .order("total_score", { ascending: false })
        .limit(10) as any;

      if (data) {
        const enrichedData = await Promise.all(
          data.map(async (lead: any) => {
            const { data: subscriber } = await sb
              .from("newsletter_subscribers")
              .select("total_opens, total_clicks")
              .eq("email", lead.email)
              .maybeSingle() as any;

            return {
              ...lead,
              total_opens: subscriber?.total_opens || 0,
              total_clicks: subscriber?.total_clicks || 0,
            };
          })
        );

        setTopPerformers(enrichedData);
      }
    } catch (error) {
      console.error("Error fetching top performers:", error);
    }
  };

  const fetchScoreDistribution = async () => {
    try {
      const { data } = await sb
        .from("lead_scores")
        .select("total_score") as any;

      if (data) {
        const ranges = [
          { range: "0-25 (Cold)", min: 0, max: 25, fill: "hsl(var(--chart-1))" },
          { range: "26-50 (Warm)", min: 26, max: 50, fill: "hsl(var(--chart-2))" },
          { range: "51-75 (Hot)", min: 51, max: 75, fill: "hsl(var(--chart-3))" },
          { range: "76-100 (Very Hot)", min: 76, max: 100, fill: "hsl(var(--chart-4))" },
        ];

        const distribution = ranges.map(range => ({
          range: range.range,
          count: data.filter((d: any) => d.total_score >= range.min && d.total_score <= range.max).length,
          fill: range.fill,
        }));

        setScoreDistribution(distribution);
      }
    } catch (error) {
      console.error("Error fetching score distribution:", error);
    }
  };

  return (
    <AdminLayout
      title="Engagement Analytics"
      description="Track email opens, clicks, and lead scoring performance"
    >
      {loading ? (
        <AnalyticsDashboardSkeleton />
      ) : (
        <div className="animate-fade-in">
          {/* Time Range Filter */}
      <div className="flex gap-2 mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
        <Button
          variant={timeRange === 7 ? "default" : "outline"}
          onClick={() => setTimeRange(7)}
          size="sm"
        >
          <Calendar className="mr-2 h-4 w-4" />
          7 Days
        </Button>
        <Button
          variant={timeRange === 30 ? "default" : "outline"}
          onClick={() => setTimeRange(30)}
          size="sm"
        >
          <Calendar className="mr-2 h-4 w-4" />
          30 Days
        </Button>
        <Button
          variant={timeRange === 90 ? "default" : "outline"}
          onClick={() => setTimeRange(90)}
          size="sm"
        >
          <Calendar className="mr-2 h-4 w-4" />
          90 Days
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Opens</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalOpens || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.openRate}% open rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalClicks || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.clickRate}% click rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Lead Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.avgLeadScore || 0}</div>
            <p className="text-xs text-muted-foreground">
              Out of 100 points
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="distribution">Score Distribution</TabsTrigger>
          <TabsTrigger value="performers">Top Performers</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Over Time</CardTitle>
              <CardDescription>Email opens and clicks for the last {timeRange} days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="opens" stroke="hsl(var(--primary))" strokeWidth={2} name="Opens" />
                  <Line type="monotone" dataKey="clicks" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Clicks" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lead Score Distribution</CardTitle>
              <CardDescription>Breakdown of leads by score range</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={scoreDistribution}
                    dataKey="count"
                    nameKey="range"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label
                  >
                    {scoreDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Leads with highest engagement scores</CardDescription>
            </CardHeader>
          <CardContent>
            {topPerformers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Engagement Data"
                description="User engagement data will appear here once your users start interacting with emails and notifications."
              >
                <div className="text-sm text-muted-foreground space-y-2 text-left">
                  <p className="font-semibold">Tracked interactions:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Email opens and clicks</li>
                    <li>Link engagement</li>
                    <li>Discussion participation</li>
                    <li>Lead scoring activities</li>
                  </ul>
                </div>
              </EmptyState>
            ) : (
              <div className="space-y-4">
                {topPerformers.map((performer, index) => (
                  <div
                    key={performer.email}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                        <Award className={`h-4 w-4 ${index < 3 ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{performer.name || performer.email}</p>
                        <p className="text-sm text-muted-foreground">{performer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{performer.total_score}</p>
                      <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                        <span>{performer.total_opens} opens</span>
                        <span>•</span>
                        <span>{performer.total_clicks} clicks</span>
                      </div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        performer.status === 'hot' ? 'bg-red-100 text-red-800' :
                        performer.status === 'warm' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {performer.status}
                      </span>
                  </div>
                </div>
              ))}
            </div>
            )}
          </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
        </div>
      )}
    </AdminLayout>
  );
}
