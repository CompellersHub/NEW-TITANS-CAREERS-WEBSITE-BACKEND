import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { PageLayout } from "@/components/layouts/PageLayout";
import { NotificationBell } from "@/components/admin/NotificationBell";
import { AnalyticsPageSkeleton } from "@/components/admin/AnalyticsPageSkeleton";
import { format, subDays, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  FileText,
  Tag,
  Calendar,
  ArrowLeft,
  Download,
  Bell,
  Activity
} from "lucide-react";

interface MetricsByPriority {
  priority: string;
  total_submissions: number;
  resolved_count: number;
  overdue_count: number;
  sla_met_count: number;
  avg_resolution_hours: number;
}

interface MetricsByAssignee {
  assigned_to: string;
  assignee_email: string;
  total_assigned: number;
  resolved_count: number;
  overdue_count: number;
  sla_met_count: number;
  avg_resolution_hours: number;
  sla_compliance_rate: number;
}

interface TagDistribution {
  tag_name: string;
  usage_count: number;
  resolved_count: number;
  avg_resolution_hours: number;
}

interface FormTypeDistribution {
  form_type: string;
  total_count: number;
  resolved_count: number;
  in_progress_count: number;
  new_count: number;
  overdue_count: number;
  resolution_rate: number;
}

interface DailyTrend {
  submission_date: string;
  total_submissions: number;
  high_priority_count: number;
  medium_priority_count: number;
  low_priority_count: number;
  resolved_count: number;
  overdue_count: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const FormSubmissionAnalytics = () => {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7' | '30' | '90'>('30');
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [updateIndicator, setUpdateIndicator] = useState(false);
  const [priorityMetrics, setPriorityMetrics] = useState<MetricsByPriority[]>([]);
  const [assigneeMetrics, setAssigneeMetrics] = useState<MetricsByAssignee[]>([]);
  const [tagDistribution, setTagDistribution] = useState<TagDistribution[]>([]);
  const [formTypeDistribution, setFormTypeDistribution] = useState<FormTypeDistribution[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrend[]>([]);
  const [overallMetrics, setOverallMetrics] = useState({
    totalSubmissions: 0,
    avgResolutionTime: 0,
    slaComplianceRate: 0,
    resolutionRate: 0,
    overdueCount: 0
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (!authLoading && user && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, authLoading, user, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchAnalytics();
    }
  }, [isAdmin, dateRange]);

  // Setup realtime subscription for form_submissions changes
  useEffect(() => {
    if (!isAdmin) return;

    const channel = supabase
      .channel('form-submissions-analytics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'form_submissions'
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          setLastUpdate(new Date());
          setUpdateIndicator(true);
          
          // Refresh analytics data
          fetchAnalytics();
          
          // Show update indicator for 2 seconds
          setTimeout(() => setUpdateIndicator(false), 2000);
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status);
        setRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const cutoffDate = subDays(new Date(), parseInt(dateRange)).toISOString();

      // Fetch priority metrics
      const { data: priorityData, error: priorityError } = await supabase
        .from("submission_metrics_by_priority" as any)
        .select("*") as any;

      if (priorityError) throw priorityError;
      setPriorityMetrics((priorityData || []) as MetricsByPriority[]);

      // Fetch assignee metrics
      const { data: assigneeData, error: assigneeError } = await supabase
        .from("submission_metrics_by_assignee" as any)
        .select("*") as any;

      if (assigneeError) throw assigneeError;
      setAssigneeMetrics((assigneeData || []) as MetricsByAssignee[]);

      // Fetch tag distribution
      const { data: tagData, error: tagError } = await supabase
        .from("tag_distribution" as any)
        .select("*")
        .limit(10) as any;

      if (tagError) throw tagError;
      setTagDistribution((tagData || []) as TagDistribution[]);

      // Fetch form type distribution
      const { data: formTypeData, error: formTypeError } = await supabase
        .from("form_type_distribution" as any)
        .select("*") as any;

      if (formTypeError) throw formTypeError;
      setFormTypeDistribution((formTypeData || []) as FormTypeDistribution[]);

      // Fetch daily trends
      const { data: trendsData, error: trendsError } = await supabase
        .from("daily_submission_trends" as any)
        .select("*")
        .gte("submission_date", cutoffDate.split('T')[0])
        .order("submission_date", { ascending: true }) as any;

      if (trendsError) throw trendsError;
      setDailyTrends((trendsData || []) as DailyTrend[]);

      // Calculate overall metrics from submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from("form_submissions" as any)
        .select("*")
        .gte("created_at", cutoffDate);

      if (submissionsError) throw submissionsError;

      if (submissions && submissions.length > 0) {
        const total = submissions.length;
        const resolved = submissions.filter((s: any) => s.status === 'resolved' || s.status === 'archived').length;
        const slaMet = submissions.filter((s: any) => s.sla_status === 'met' || s.status === 'resolved' || s.status === 'archived').length;
        const overdue = submissions.filter((s: any) => s.sla_status === 'overdue').length;
        
        const avgResolution = submissions
          .filter((s: any) => (s.status === 'resolved' || s.status === 'archived') && s.last_updated_at)
          .reduce((acc: number, s: any) => {
            const diff = new Date(s.last_updated_at).getTime() - new Date(s.created_at).getTime();
            return acc + (diff / (1000 * 60 * 60));
          }, 0);
        
        const resolvedCount = submissions.filter((s: any) => (s.status === 'resolved' || s.status === 'archived') && s.last_updated_at).length;

        setOverallMetrics({
          totalSubmissions: total,
          avgResolutionTime: resolvedCount > 0 ? avgResolution / resolvedCount : 0,
          slaComplianceRate: total > 0 ? (slaMet / total) * 100 : 0,
          resolutionRate: total > 0 ? (resolved / total) * 100 : 0,
          overdueCount: overdue
        });
      }
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportAnalytics = () => {
    const csvContent = [
      ['Analytics Report - Generated ' + format(new Date(), 'PPpp')],
      [],
      ['Overall Metrics'],
      ['Total Submissions', overallMetrics.totalSubmissions],
      ['Average Resolution Time (hours)', overallMetrics.avgResolutionTime.toFixed(2)],
      ['SLA Compliance Rate (%)', overallMetrics.slaComplianceRate.toFixed(2)],
      ['Resolution Rate (%)', overallMetrics.resolutionRate.toFixed(2)],
      ['Overdue Submissions', overallMetrics.overdueCount],
      [],
      ['Priority Metrics'],
      ['Priority', 'Total', 'Resolved', 'Overdue', 'SLA Met', 'Avg Resolution Hours'],
      ...priorityMetrics.map(m => [
        m.priority.toUpperCase(),
        m.total_submissions,
        m.resolved_count,
        m.overdue_count,
        m.sla_met_count,
        m.avg_resolution_hours || 0
      ]),
      [],
      ['Assignee Performance'],
      ['Assignee', 'Total Assigned', 'Resolved', 'Overdue', 'SLA Compliance %', 'Avg Resolution Hours'],
      ...assigneeMetrics.map(m => [
        m.assignee_email,
        m.total_assigned,
        m.resolved_count,
        m.overdue_count,
        m.sla_compliance_rate || 0,
        m.avg_resolution_hours || 0
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Analytics report has been downloaded",
    });
  };

  if (authLoading || isLoading) {
    return <AnalyticsPageSkeleton />;
  }

  return (
    <PageLayout intensity3D="subtle" show3D={true}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin/form-submissions")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Submissions
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">Form Submission Analytics</h1>
                {realtimeConnected && (
                  <Badge 
                    variant="outline" 
                    className={`${updateIndicator ? 'bg-green-500 text-white animate-pulse' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}
                  >
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-current"></div>
                      {updateIndicator ? 'Updating...' : 'Live'}
                    </div>
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground">Comprehensive insights and metrics</p>
                {lastUpdate && (
                  <span className="text-xs text-muted-foreground">
                    • Last updated {formatDistanceToNow(lastUpdate, { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate("/admin/sla-alert-history")} variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Alert History
            </Button>
            <NotificationBell />
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportAnalytics} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallMetrics.totalSubmissions}</div>
              <p className="text-xs text-muted-foreground">Last {dateRange} days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallMetrics.avgResolutionTime.toFixed(1)}h</div>
              <p className="text-xs text-muted-foreground">Average response time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallMetrics.slaComplianceRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Meeting deadlines</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallMetrics.resolutionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Completed submissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{overallMetrics.overdueCount}</div>
              <p className="text-xs text-muted-foreground">Past SLA deadline</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Daily Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Trends</CardTitle>
              <CardDescription>Daily submission volume over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="submission_date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(value) => format(new Date(value), 'MMM d, yyyy')}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total_submissions" stroke="#3b82f6" name="Total" />
                  <Line type="monotone" dataKey="resolved_count" stroke="#10b981" name="Resolved" />
                  <Line type="monotone" dataKey="overdue_count" stroke="#ef4444" name="Overdue" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Submissions by priority level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityMetrics}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ priority, total_submissions }) => `${priority.toUpperCase()}: ${total_submissions}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_submissions"
                  >
                    {priorityMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Form Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Form Type Performance</CardTitle>
              <CardDescription>Resolution rates by form type</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formTypeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="form_type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_count" fill="#3b82f6" name="Total" />
                  <Bar dataKey="resolved_count" fill="#10b981" name="Resolved" />
                  <Bar dataKey="overdue_count" fill="#ef4444" name="Overdue" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tag Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Top Tags</CardTitle>
              <CardDescription>Most frequently used tags</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tagDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="tag_name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="usage_count" fill="#8b5cf6" name="Usage Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Assignee Performance Table */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Individual assignee metrics and SLA compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Assignee</th>
                    <th className="text-right p-2">Total Assigned</th>
                    <th className="text-right p-2">Resolved</th>
                    <th className="text-right p-2">Overdue</th>
                    <th className="text-right p-2">Avg Resolution (hrs)</th>
                    <th className="text-right p-2">SLA Compliance</th>
                  </tr>
                </thead>
                <tbody>
                  {assigneeMetrics.map((assignee) => (
                    <tr key={assignee.assigned_to} className="border-b">
                      <td className="p-2 font-medium">{assignee.assignee_email}</td>
                      <td className="text-right p-2">{assignee.total_assigned}</td>
                      <td className="text-right p-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          {assignee.resolved_count}
                        </Badge>
                      </td>
                      <td className="text-right p-2">
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
                          {assignee.overdue_count}
                        </Badge>
                      </td>
                      <td className="text-right p-2">{assignee.avg_resolution_hours?.toFixed(1) || 'N/A'}</td>
                      <td className="text-right p-2">
                        <Badge 
                          variant="outline" 
                          className={
                            (assignee.sla_compliance_rate || 0) >= 90 
                              ? "bg-green-500/10 text-green-500 border-green-500/20" 
                              : (assignee.sla_compliance_rate || 0) >= 70
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                              : "bg-red-500/10 text-red-500 border-red-500/20"
                          }
                        >
                          {assignee.sla_compliance_rate?.toFixed(1) || '0'}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Priority Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Priority Level Comparison</CardTitle>
            <CardDescription>Performance metrics across priority levels</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priorityMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="total_submissions" fill="#3b82f6" name="Total Submissions" />
                <Bar yAxisId="left" dataKey="resolved_count" fill="#10b981" name="Resolved" />
                <Bar yAxisId="right" dataKey="avg_resolution_hours" fill="#f59e0b" name="Avg Resolution (hrs)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default FormSubmissionAnalytics;
