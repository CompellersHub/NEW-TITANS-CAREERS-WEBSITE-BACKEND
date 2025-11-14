import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface EngagementMetrics {
  totalClicks: number;
  unsubscribeRate: number;
  clicksByType: Array<{ link_type: string; count: number }>;
  clicksByEmail: Array<{ email_type: string; count: number }>;
  dailyTrend: Array<{ date: string; clicks: number }>;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function EmailEngagementDashboard() {
  const [metrics, setMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEngagementMetrics();
  }, []);

  const fetchEngagementMetrics = async () => {
    try {
      setLoading(true);

      // Fetch all engagement data
      const { data: engagementData, error } = await supabase
        .from("email_engagement_tracking")
        .select("*")
        .order("clicked_at", { ascending: false });

      if (error) throw error;

      if (!engagementData) {
        setMetrics({
          totalClicks: 0,
          unsubscribeRate: 0,
          clicksByType: [],
          clicksByEmail: [],
          dailyTrend: [],
        });
        return;
      }

      // Calculate metrics
      const totalClicks = engagementData.length;
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

      // Group by day for trend
      const dailyTrend = Object.entries(
        engagementData.reduce((acc, item) => {
          const date = new Date(item.clicked_at).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      )
        .map(([date, clicks]) => ({ date, clicks }))
        .reverse()
        .slice(-30); // Last 30 days

      setMetrics({
        totalClicks,
        unsubscribeRate,
        clicksByType,
        clicksByEmail,
        dailyTrend,
      });
    } catch (error: any) {
      console.error("Error fetching engagement metrics:", error);
      toast({
        title: "Error",
        description: "Failed to load engagement metrics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">No engagement data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Email Engagement Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track how users interact with your email notifications
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Clicks</CardTitle>
            <CardDescription>All email link clicks</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">{metrics.totalClicks}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unsubscribe Rate</CardTitle>
            <CardDescription>Users who unsubscribed</CardDescription>
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
            <CardDescription>Users managing settings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-accent">
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
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Click Trends</CardTitle>
              <CardDescription>Email engagement over the last 30 days</CardDescription>
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
                    dataKey="clicks"
                    stroke="hsl(var(--primary))"
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
      </Tabs>
    </div>
  );
}
