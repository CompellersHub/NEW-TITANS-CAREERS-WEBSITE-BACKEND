import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { DataFetchError } from "@/components/error/DataFetchError";
import { EngagementDashboardSkeleton } from "@/components/skeletons/EngagementDashboardSkeleton";
import { EmptyState } from "@/components/error/EmptyState";
import { Mail, BarChart3, MousePointer } from "lucide-react";

interface EngagementMetrics {
  totalClicks: number;
  totalSends: number;
  totalOpens: number;
  openRate: number;
  clickRate: number;
  unsubscribeRate: number;
  clicksByType: Array<{ link_type: string; count: number }>;
  clicksByEmail: Array<{ email_type: string; count: number }>;
  dailyTrend: Array<{ date: string; clicks: number; opens: number; sends: number }>;
  emailClientDistribution: Array<{ client: string; count: number; percentage: number }>;
  geoDistribution: Array<{ country: string; count: number; percentage: number }>;
  topCities: Array<{ city: string; country: string; count: number }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function EmailEngagementDashboard() {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retrying, setRetrying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEngagementMetrics();
  }, []);

  const fetchEngagementMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all engagement data (clicks)
      const { data: engagementData, error } = await supabase
        .from("email_engagement_tracking")
        .select("*")
        .order("clicked_at", { ascending: false });

      if (error) throw error;

      // Fetch all email sends and opens
      const { data: emailSends, error: sendsError } = await supabase
        .from("email_sends")
        .select("*")
        .order("sent_at", { ascending: false });

      if (sendsError) throw sendsError;

      if (!engagementData || !emailSends) {
        setMetrics({
          totalClicks: 0,
          totalSends: 0,
          totalOpens: 0,
          openRate: 0,
          clickRate: 0,
          unsubscribeRate: 0,
          clicksByType: [],
          clicksByEmail: [],
          dailyTrend: [],
          emailClientDistribution: [],
          geoDistribution: [],
          topCities: [],
        });
        return;
      }

      // Calculate email send metrics
      const totalSends = emailSends.length;
      const totalOpens = emailSends.filter((e) => e.opened_at !== null).length;
      const openRate = totalSends > 0 ? (totalOpens / totalSends) * 100 : 0;

      // Calculate click metrics
      const totalClicks = engagementData.length;
      const clickRate = totalSends > 0 ? (totalClicks / totalSends) * 100 : 0;
      const unsubscribeClicks = engagementData.filter(
        (e) => e.link_type === "unsubscribe_digest" || e.link_type === "unsubscribe_all"
      ).length;
      const unsubscribeRate = totalClicks > 0 ? (unsubscribeClicks / totalClicks) * 100 : 0;

      // Group by link type
      const clicksByType = Object.entries(
        engagementData.reduce((acc, item) => {
          acc[item.link_type] = (acc[item.link_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([link_type, count]) => ({
        link_type: link_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        count,
      }));

      // Group by email type
      const clicksByEmail = Object.entries(
        engagementData.reduce((acc, item) => {
          acc[item.email_type] = (acc[item.email_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([email_type, count]) => ({
        email_type: email_type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        count,
      }));

      // Group by day for trend - combine sends, opens, and clicks
      const allDates = new Set<string>();
      emailSends.forEach((item) => {
        const date = new Date(item.sent_at).toLocaleDateString();
        allDates.add(date);
      });
      engagementData.forEach((item) => {
        const date = new Date(item.clicked_at).toLocaleDateString();
        allDates.add(date);
      });

      const dailyTrend = Array.from(allDates)
        .map((date) => {
          const sends = emailSends.filter(
            (item) => new Date(item.sent_at).toLocaleDateString() === date
          ).length;
          const opens = emailSends.filter(
            (item) => item.opened_at && new Date(item.opened_at).toLocaleDateString() === date
          ).length;
          const clicks = engagementData.filter(
            (item) => new Date(item.clicked_at).toLocaleDateString() === date
          ).length;
          return { date, sends, opens, clicks };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-30); // Last 30 days

      // Get email client distribution
      const clientCounts = new Map<string, number>();
      engagementData.forEach((row) => {
        const client = (row.metadata as any)?.email_client || "Unknown";
        clientCounts.set(client, (clientCounts.get(client) || 0) + 1);
      });

      const totalClientEvents = engagementData.length || 1;
      const emailClientDistribution = Array.from(clientCounts.entries())
        .map(([client, count]) => ({
          client,
          count,
          percentage: (count / totalClientEvents) * 100,
        }))
        .sort((a, b) => b.count - a.count);

      // Get geographic distribution
      const countryCounts = new Map<string, number>();
      engagementData.forEach((row) => {
        if (row.country) {
          countryCounts.set(row.country, (countryCounts.get(row.country) || 0) + 1);
        }
      });

      const totalGeoEvents = Array.from(countryCounts.values()).reduce((sum, count) => sum + count, 0) || 1;
      const geoDistribution = Array.from(countryCounts.entries())
        .map(([country, count]) => ({
          country,
          count,
          percentage: (count / totalGeoEvents) * 100,
        }))
        .sort((a, b) => b.count - a.count);

      // Get top cities
      const cityCounts = new Map<string, { country: string; count: number }>();
      engagementData.forEach((row) => {
        if (row.city && row.country) {
          const key = `${row.city}, ${row.country}`;
          const existing = cityCounts.get(key);
          cityCounts.set(key, {
            country: row.country,
            count: (existing?.count || 0) + 1,
          });
        }
      });

      const topCities = Array.from(cityCounts.entries())
        .map(([cityKey, data]) => ({
          city: cityKey,
          country: data.country,
          count: data.count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setMetrics({
        totalClicks,
        totalSends,
        totalOpens,
        openRate,
        clickRate,
        unsubscribeRate,
        clicksByType,
        clicksByEmail,
        dailyTrend,
        emailClientDistribution,
        geoDistribution,
        topCities,
      });
    } catch (error: any) {
      console.error("Error fetching engagement metrics:", error);
      setError(error);
      if (!retrying) {
        toast({
          title: "Error",
          description: "Failed to load engagement metrics",
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
    await fetchEngagementMetrics();
  };

  if (loading) {
    return <EngagementDashboardSkeleton />;
  }

  if (error && !loading) {
    return (
      <ErrorBoundary onReset={handleRetry}>
        <DataFetchError
          title="Failed to Load Engagement Data"
          description="We couldn't fetch your email engagement metrics. This might be a temporary issue with the connection."
          error={error}
          onRetry={handleRetry}
          retrying={retrying}
        />
      </ErrorBoundary>
    );
  }

  if (!metrics && !loading) {
    return (
      <ErrorBoundary onReset={fetchEngagementMetrics}>
        <EmptyState
          icon={Mail}
          title="No Engagement Data Yet"
          description="Start sending emails to see engagement metrics, open rates, and click tracking analytics here."
          action={{
            label: "Refresh Data",
            onClick: fetchEngagementMetrics,
            variant: "default"
          }}
          secondaryAction={{
            label: "View Documentation",
            onClick: () => window.open("/docs", "_blank")
          }}
        >
          <div className="text-sm text-muted-foreground space-y-2 text-left">
            <p className="font-semibold">Get started by:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Sending digest emails to users</li>
              <li>Enabling email notifications</li>
              <li>Tracking discussion replies via email</li>
            </ul>
          </div>
        </EmptyState>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary onReset={fetchEngagementMetrics}>
      <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Email Engagement Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track how users interact with your email notifications
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
        <Card>
          <CardHeader>
            <CardTitle>Total Sends</CardTitle>
            <CardDescription>Emails sent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{metrics.totalSends}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Rate</CardTitle>
            <CardDescription>Emails opened</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">
              {metrics.openRate.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {metrics.totalOpens} opens
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Click Rate</CardTitle>
            <CardDescription>Link clicks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-accent">
              {metrics.clickRate.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {metrics.totalClicks} clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unsubscribe Rate</CardTitle>
            <CardDescription>Of total clicks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-destructive">
              {metrics.unsubscribeRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preference Clicks</CardTitle>
            <CardDescription>Settings managed</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-secondary">
              {metrics.clicksByType.find((t) => t.link_type.includes("Preferences"))?.count || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charts */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Click Trends</TabsTrigger>
          <TabsTrigger value="types">Link Types</TabsTrigger>
          <TabsTrigger value="emails">Email Types</TabsTrigger>
          <TabsTrigger value="clients">Email Clients</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Engagement Trends</CardTitle>
              <CardDescription>Email sends, opens, and clicks over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={metrics.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="sends"
                    stroke="hsl(var(--muted))"
                    strokeWidth={2}
                    name="Sends"
                  />
                  <Line
                    type="monotone"
                    dataKey="opens"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Opens"
                  />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    name="Clicks"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clicks by Link Type</CardTitle>
                <CardDescription>Distribution of link clicks</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={metrics.clicksByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.link_type}: ${entry.count}`}
                      outerRadius={80}
                      fill="hsl(var(--primary))"
                      dataKey="count"
                    >
                      {metrics.clicksByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Link Type Performance</CardTitle>
                <CardDescription>Comparison of click counts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={metrics.clicksByType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="link_type" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="emails" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Clicks by Email Type</CardTitle>
                <CardDescription>Digest vs instant notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={metrics.clicksByEmail}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.email_type}: ${entry.count}`}
                      outerRadius={80}
                      fill="hsl(var(--secondary))"
                      dataKey="count"
                    >
                      {metrics.clicksByEmail.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Type Performance</CardTitle>
                <CardDescription>Click counts by email type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={metrics.clicksByEmail}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="email_type" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Client Distribution</CardTitle>
              <CardDescription>Which email clients your users are using</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.emailClientDistribution}
                        dataKey="count"
                        nameKey="client"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.client}: ${entry.percentage.toFixed(1)}%`}
                      >
                        {metrics.emailClientDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [value, "Events"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Top Email Clients</h3>
                  {metrics.emailClientDistribution.slice(0, 10).map((client, index) => (
                    <div key={client.client} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{client.client}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{client.count} events</span>
                        <span className="text-sm text-muted-foreground">
                          ({client.percentage.toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Where your users are opening emails</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics.geoDistribution}
                        dataKey="count"
                        nameKey="country"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.country}: ${entry.percentage.toFixed(1)}%`}
                      >
                        {metrics.geoDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [value, "Events"]}
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
                <CardDescription>Countries by engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={metrics.geoDistribution.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="country" 
                      stroke="hsl(var(--muted-foreground))"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Cities</CardTitle>
              <CardDescription>Most active cities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.topCities.map((city, index) => (
                  <div key={city.city} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{city.city}</p>
                        <p className="text-sm text-muted-foreground">{city.country}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{city.count} events</p>
                    </div>
                  </div>
                ))}
                {metrics.topCities.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No geographic data available yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </ErrorBoundary>
  );
}
