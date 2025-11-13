import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnalyticsPageSkeleton } from "@/components/admin/AnalyticsPageSkeleton";
import { ArrowLeft, AlertCircle, Clock, CheckCircle, TrendingDown, TrendingUp } from "lucide-react";
import { formatDistanceToNow, format, differenceInMinutes } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface AlertHistoryItem {
  id: string;
  submission_id: string;
  alert_type: string;
  sent_to: string;
  sent_at: string;
  alert_data: any;
  admin_email?: string;
  submission_status?: string;
  submission_priority?: string;
  response_time_minutes?: number;
  was_resolved?: boolean;
}

interface EffectivenessMetrics {
  total_alerts: number;
  approaching_alerts: number;
  overdue_alerts: number;
  compliance_alerts: number;
  avg_response_time: number;
  resolution_rate: number;
  alerts_leading_to_resolution: number;
}

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function SLAAlertHistory() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<AlertHistoryItem[]>([]);
  const [metrics, setMetrics] = useState<EffectivenessMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchAlertHistory();
  }, [isAdmin, dateRange]);

  const fetchAlertHistory = async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - dateRange);

      // Fetch alerts with admin email and submission data
      const { data: alertsData, error: alertsError } = await supabase
        .from("sla_alerts" as any)
        .select(`
          *,
          form_submissions!inner(status, priority, last_updated_at, form_type)
        `)
        .gte("sent_at", startDate.toISOString())
        .order("sent_at", { ascending: false }) as any;

      if (alertsError) throw alertsError;

      // Get admin emails
      const adminIds = [...new Set(alertsData?.map((a: any) => a.sent_to) || [])];
      const { data: prefsData } = await supabase
        .from("admin_notification_preferences" as any)
        .select("admin_user_id, email")
        .in("admin_user_id", adminIds) as any;

      const emailMap = new Map(prefsData?.map((p: any) => [p.admin_user_id, p.email]) || []);

      // Calculate response times
      const enrichedAlerts: AlertHistoryItem[] = (alertsData || []).map((alert: any) => {
        const submission = alert.form_submissions;
        const responseTime = submission?.last_updated_at 
          ? differenceInMinutes(new Date(submission.last_updated_at), new Date(alert.sent_at))
          : null;

        return {
          id: alert.id,
          submission_id: alert.submission_id,
          alert_type: alert.alert_type,
          sent_to: alert.sent_to,
          sent_at: alert.sent_at,
          alert_data: alert.alert_data,
          admin_email: emailMap.get(alert.sent_to) || "Unknown",
          submission_status: submission?.status,
          submission_priority: submission?.priority,
          response_time_minutes: responseTime && responseTime > 0 ? responseTime : null,
          was_resolved: submission?.status === 'resolved' || submission?.status === 'archived',
        };
      });

      setAlerts(enrichedAlerts);

      // Calculate metrics
      const total = enrichedAlerts.length;
      const approaching = enrichedAlerts.filter(a => a.alert_type === 'sla_approaching').length;
      const overdue = enrichedAlerts.filter(a => a.alert_type === 'sla_overdue').length;
      const compliance = enrichedAlerts.filter(a => a.alert_type === 'compliance_low').length;
      
      const resolvedAfterAlert = enrichedAlerts.filter(a => a.was_resolved && a.response_time_minutes).length;
      const alertsWithResponse = enrichedAlerts.filter(a => a.response_time_minutes !== null);
      const avgResponse = alertsWithResponse.length > 0
        ? alertsWithResponse.reduce((sum, a) => sum + (a.response_time_minutes || 0), 0) / alertsWithResponse.length
        : 0;

      setMetrics({
        total_alerts: total,
        approaching_alerts: approaching,
        overdue_alerts: overdue,
        compliance_alerts: compliance,
        avg_response_time: avgResponse,
        resolution_rate: total > 0 ? (resolvedAfterAlert / total) * 100 : 0,
        alerts_leading_to_resolution: resolvedAfterAlert,
      });

    } catch (error) {
      console.error("Error fetching alert history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'sla_overdue':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'sla_approaching':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'compliance_low':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getAlertBadgeColor = (type: string) => {
    switch (type) {
      case 'sla_overdue':
        return "bg-destructive/10 text-destructive border-destructive/20";
      case 'sla_approaching':
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case 'compliance_low':
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const alertTypeDistribution = metrics ? [
    { name: 'Approaching', value: metrics.approaching_alerts },
    { name: 'Overdue', value: metrics.overdue_alerts },
    { name: 'Low Compliance', value: metrics.compliance_alerts },
  ].filter(item => item.value > 0) : [];

  const responseTimeData = alerts
    .filter(a => a.response_time_minutes && a.response_time_minutes < 1440)
    .slice(0, 20)
    .map((a, idx) => ({
      name: `Alert ${idx + 1}`,
      minutes: a.response_time_minutes,
      type: a.alert_type,
    }));

  if (loading) {
    return <AnalyticsPageSkeleton />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/form-analytics")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">SLA Alert History</h1>
            <p className="text-muted-foreground">Track alert effectiveness and response times</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={dateRange === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(7)}
          >
            7 Days
          </Button>
          <Button
            variant={dateRange === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(30)}
          >
            30 Days
          </Button>
          <Button
            variant={dateRange === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange(90)}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts Sent</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total_alerts}</div>
              <p className="text-xs text-muted-foreground">Last {dateRange} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.avg_response_time < 60
                  ? `${Math.round(metrics.avg_response_time)}m`
                  : `${(metrics.avg_response_time / 60).toFixed(1)}h`}
              </div>
              <p className="text-xs text-muted-foreground">Time to action after alert</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.resolution_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.alerts_leading_to_resolution} of {metrics.total_alerts} resolved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alert Effectiveness</CardTitle>
              {metrics.resolution_rate >= 70 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-amber-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.resolution_rate >= 70 ? "High" : metrics.resolution_rate >= 50 ? "Medium" : "Low"}
              </div>
              <p className="text-xs text-muted-foreground">Based on resolution rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alert Type Distribution</CardTitle>
            <CardDescription>Breakdown of alerts by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={alertTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {alertTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time Trend</CardTitle>
            <CardDescription>Time to action after alert (recent 20)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line type="monotone" dataKey="minutes" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Alert History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alert History</CardTitle>
          <CardDescription>Complete list of all SLA alerts sent</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alert Type</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Submission ID</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {alerts.map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAlertIcon(alert.alert_type)}
                        <Badge variant="outline" className={getAlertBadgeColor(alert.alert_type)}>
                          {alert.alert_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{alert.admin_email}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {alert.submission_id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        alert.submission_priority === 'high' ? 'destructive' :
                        alert.submission_priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {alert.submission_priority}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(alert.sent_at), "MMM d, HH:mm")}</TableCell>
                    <TableCell>
                      {alert.response_time_minutes ? (
                        <span className={
                          alert.response_time_minutes < 60 ? "text-green-600" :
                          alert.response_time_minutes < 240 ? "text-amber-600" : "text-destructive"
                        }>
                          {alert.response_time_minutes < 60
                            ? `${alert.response_time_minutes}m`
                            : `${(alert.response_time_minutes / 60).toFixed(1)}h`}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {alert.was_resolved ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="outline">{alert.submission_status}</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
