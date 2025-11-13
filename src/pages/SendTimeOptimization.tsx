import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const sb: any = supabase;
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { 
  Clock, 
  Calendar,
  TrendingUp,
  RefreshCw,
  Zap,
  BarChart3
} from "lucide-react";

interface SubscriberOptimization {
  id: string;
  email: string;
  optimal_send_hour: number | null;
  optimal_send_day: string | null;
  engagement_score: number;
  last_send_time_analysis: string | null;
  metadata: any;
}

export default function SendTimeOptimization() {
  const [subscribers, setSubscribers] = useState<SubscriberOptimization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    optimized: 0,
    needsAnalysis: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await sb
        .from("newsletter_subscribers")
        .select("id, email, optimal_send_hour, optimal_send_day, engagement_score, last_send_time_analysis, metadata")
        .eq("active", true)
        .order("engagement_score", { ascending: false })
        .limit(100);

      if (error) throw error;

      setSubscribers(data || []);

      // Calculate stats
      const total = data?.length || 0;
      const optimized = data?.filter(s => s.optimal_send_hour !== null).length || 0;
      const needsAnalysis = total - optimized;

      setStats({ total, optimized, needsAnalysis });
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load optimization data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunOptimization = async () => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("optimize-send-times");

      if (error) throw error;

      toast.success(`Optimization complete! Updated ${data.updated_count} subscribers`);
      loadData();
    } catch (error: any) {
      console.error("Error running optimization:", error);
      toast.error(error.message || "Failed to run optimization");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:00 ${ampm}`;
  };

  const getConfidenceBadge = (metadata: any) => {
    const confidence = metadata?.send_time_optimization?.confidence;
    if (!confidence) return null;

    const variant = confidence === "high" ? "default" : confidence === "medium" ? "secondary" : "outline";
    return <Badge variant={variant}>{confidence} confidence</Badge>;
  };

  const groupByHour = () => {
    const hourCounts = subscribers.reduce((acc, s) => {
      if (s.optimal_send_hour !== null) {
        acc[s.optimal_send_hour] = (acc[s.optimal_send_hour] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(hourCounts)
      .sort((a, b) => parseInt(b[1] as any) - parseInt(a[1] as any))
      .slice(0, 5);
  };

  const groupByDay = () => {
    const dayCounts = subscribers.reduce((acc, s) => {
      if (s.optimal_send_day) {
        acc[s.optimal_send_day] = (acc[s.optimal_send_day] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dayCounts)
      .sort((a, b) => parseInt(b[1] as any) - parseInt(a[1] as any));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 mt-20">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">AI Send Time Optimization</h1>
              <p className="text-muted-foreground">
                Personalized email delivery based on individual engagement patterns
              </p>
            </div>
            <Button onClick={handleRunOptimization} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Run Optimization
                </>
              )}
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Active subscribers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Optimized</CardTitle>
                <Zap className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{stats.optimized}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total > 0 ? ((stats.optimized / stats.total) * 100).toFixed(0) : 0}% of subscribers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Needs Analysis</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.needsAnalysis}</div>
                <p className="text-xs text-muted-foreground">Awaiting optimization</p>
              </CardContent>
            </Card>
          </div>

          {/* Distribution Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Popular Send Hours
                </CardTitle>
                <CardDescription>Most common optimal times</CardDescription>
              </CardHeader>
              <CardContent>
                {groupByHour().length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No optimization data yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {groupByHour().map(([hour, count]) => (
                      <div key={hour} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{formatHour(parseInt(hour))}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-secondary rounded-full h-2">
                            <div
                              className="bg-accent h-2 rounded-full"
                              style={{ width: `${(count / stats.optimized) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {count} users
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Optimal Days
                </CardTitle>
                <CardDescription>Best days for engagement</CardDescription>
              </CardHeader>
              <CardContent>
                {groupByDay().length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No optimization data yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {groupByDay().map(([day, count]) => (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{day}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-secondary rounded-full h-2">
                            <div
                              className="bg-accent h-2 rounded-full"
                              style={{ width: `${(count / stats.optimized) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {count} users
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subscriber List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Subscriber Optimization Status</CardTitle>
                <CardDescription>Individual send time preferences</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground text-sm text-center py-8">Loading...</p>
              ) : subscribers.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">
                  No subscribers found
                </p>
              ) : (
                <div className="space-y-4">
                  {subscribers.slice(0, 20).map((subscriber) => (
                    <div
                      key={subscriber.id}
                      className="p-4 border rounded-lg flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{subscriber.email}</p>
                        {subscriber.optimal_send_hour !== null && subscriber.optimal_send_day ? (
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">
                              Best time: {subscriber.optimal_send_day} at {formatHour(subscriber.optimal_send_hour)}
                            </p>
                            {getConfidenceBadge(subscriber.metadata)}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-1">
                            Not yet analyzed
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">Score</p>
                          <p className="text-lg font-bold text-accent">
                            {subscriber.engagement_score || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
