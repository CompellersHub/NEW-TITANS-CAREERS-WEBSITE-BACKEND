import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layouts/PageLayout";
import { PageTransition } from "@/components/PageTransition";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Loader2, 
  TrendingUp, 
  Bell, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Mail,
  MessageSquare,
  Send,
  BarChart3,
  Users,
  Brain,
  ArrowRight,
  Settings
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";

interface AlertRecord {
  id: string;
  alert_type: string;
  channel: string;
  metric_value: number;
  threshold_value: number;
  admin_email: string;
  sent_at: string;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  status: string;
  resolution_notes: string | null;
}

export default function AlertAnalytics() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertRecord | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"acknowledge" | "resolve" | "ignore">("acknowledge");

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);
      await loadAlerts();
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    const { data, error } = await supabase
      .from('recovery_alert_history' as any)
      .select('*')
      .order('sent_at', { ascending: false });

    if (error) {
      console.error('Error loading alerts:', error);
      toast({
        title: "Error",
        description: "Failed to load alert data",
        variant: "destructive",
      });
      return;
    }

    setAlerts(data as any || []);
  };

  const handleAlertAction = async (alert: AlertRecord, action: "acknowledge" | "resolve" | "ignore") => {
    setSelectedAlert(alert);
    setActionType(action);
    setResolutionNotes("");
    setDialogOpen(true);
  };

  const confirmAlertAction = async () => {
    if (!selectedAlert) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updates: any = {};

      if (actionType === "acknowledge") {
        updates.acknowledged_at = new Date().toISOString();
        updates.acknowledged_by = user.id;
        updates.status = "acknowledged";
      } else if (actionType === "resolve") {
        updates.resolved_at = new Date().toISOString();
        updates.resolved_by = user.id;
        updates.status = "resolved";
        updates.resolution_notes = resolutionNotes || null;
      } else if (actionType === "ignore") {
        updates.status = "ignored";
        updates.resolution_notes = resolutionNotes || null;
      }

      const { error } = await supabase
        .from('recovery_alert_history' as any)
        .update(updates)
        .eq('id', selectedAlert.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Alert ${actionType}d successfully`,
      });

      setDialogOpen(false);
      await loadAlerts();
    } catch (error: any) {
      console.error('Error updating alert:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update alert",
        variant: "destructive",
      });
    }
  };

  const calculateMetrics = () => {
    const now = Date.now();
    const last30Days = alerts.filter(a => 
      new Date(a.sent_at).getTime() > now - 30 * 24 * 60 * 60 * 1000
    );

    const acknowledged = alerts.filter(a => a.status === 'acknowledged' || a.status === 'resolved');
    const resolved = alerts.filter(a => a.status === 'resolved');
    const pending = alerts.filter(a => a.status === 'pending');

    // Calculate average response time (time to acknowledge)
    const acknowledgedWithTime = acknowledged.filter(a => a.acknowledged_at && a.sent_at);
    const avgResponseTime = acknowledgedWithTime.length > 0
      ? acknowledgedWithTime.reduce((sum, a) => {
          const sent = new Date(a.sent_at).getTime();
          const ack = new Date(a.acknowledged_at!).getTime();
          return sum + (ack - sent);
        }, 0) / acknowledgedWithTime.length
      : 0;

    // Calculate average resolution time
    const resolvedWithTime = resolved.filter(a => a.resolved_at && a.sent_at);
    const avgResolutionTime = resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((sum, a) => {
          const sent = new Date(a.sent_at).getTime();
          const res = new Date(a.resolved_at!).getTime();
          return sum + (res - sent);
        }, 0) / resolvedWithTime.length
      : 0;

    return {
      totalAlerts: alerts.length,
      last30DaysAlerts: last30Days.length,
      pendingAlerts: pending.length,
      acknowledgedAlerts: acknowledged.length,
      resolvedAlerts: resolved.length,
      avgResponseTimeHours: avgResponseTime / (1000 * 60 * 60),
      avgResolutionTimeHours: avgResolutionTime / (1000 * 60 * 60),
      resolutionRate: alerts.length > 0 ? (resolved.length / alerts.length) * 100 : 0,
    };
  };

  const getVolumeData = () => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return format(date, 'MM/dd');
    });

    const volumeByDate: { [key: string]: number } = {};
    last30Days.forEach(date => volumeByDate[date] = 0);

    alerts.forEach(alert => {
      const date = format(new Date(alert.sent_at), 'MM/dd');
      if (volumeByDate[date] !== undefined) {
        volumeByDate[date]++;
      }
    });

    return last30Days.map(date => ({
      date,
      alerts: volumeByDate[date],
    }));
  };

  const getChannelDistribution = () => {
    const distribution: { [key: string]: number } = {
      email: 0,
      sms: 0,
      whatsapp: 0,
      overall: 0,
    };

    alerts.forEach(alert => {
      distribution[alert.channel] = (distribution[alert.channel] || 0) + 1;
    });

    return Object.entries(distribution).map(([channel, value]) => ({
      name: channel.charAt(0).toUpperCase() + channel.slice(1),
      value,
    }));
  };

  const getTypeDistribution = () => {
    const distribution: { [key: string]: number } = {};

    alerts.forEach(alert => {
      const type = alert.alert_type === 'conversion_drop' ? 'Conversion Rate' : 'Negative ROI';
      distribution[type] = (distribution[type] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name,
      value,
    }));
  };

  const getStatusDistribution = () => {
    const distribution: { [key: string]: number } = {
      pending: 0,
      acknowledged: 0,
      resolved: 0,
      ignored: 0,
    };

    alerts.forEach(alert => {
      distribution[alert.status] = (distribution[alert.status] || 0) + 1;
    });

    return Object.entries(distribution).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  };

  const COLORS = {
    email: '#3b82f6',
    sms: '#8b5cf6',
    whatsapp: '#10b981',
    overall: '#f59e0b',
    pending: '#ef4444',
    acknowledged: '#f59e0b',
    resolved: '#10b981',
    ignored: '#6b7280',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <PageTransition>
        <PageLayout intensity3D="subtle" show3D={true}>
          <div className="container mx-auto px-4 py-24">
            <Alert variant="destructive">
              <AlertDescription>
                You do not have permission to access this page. Admin access required.
              </AlertDescription>
            </Alert>
          </div>
        </PageLayout>
      </PageTransition>
    );
  }

  const metrics = calculateMetrics();

  return (
    <PageTransition>
      <PageLayout intensity3D="subtle" show3D={true}>
        <div className="container mx-auto px-4 py-24">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Alert Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Track alert volume, response times, and team performance metrics
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/predictive-analytics')}>
              <Brain className="mr-2 h-4 w-4" />
              Predictive Analytics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/recovery-alert-settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Alert Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Alerts</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.last30DaysAlerts} in last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.avgResponseTimeHours.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Time to acknowledge
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.avgResolutionTimeHours.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground">
                Time to resolve issue
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.resolutionRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.resolvedAlerts} of {metrics.totalAlerts} resolved
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="volume" className="space-y-6">
          <TabsList>
            <TabsTrigger value="volume">Volume Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="alerts">Alert List</TabsTrigger>
          </TabsList>

          <TabsContent value="volume" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Volume (Last 30 Days)</CardTitle>
                <CardDescription>Daily alert count over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getVolumeData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="alerts" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Alerts"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Channel Distribution</CardTitle>
                  <CardDescription>Alerts by channel type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getChannelDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getChannelDistribution().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Alert Type Distribution</CardTitle>
                  <CardDescription>Conversion vs ROI alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getTypeDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getTypeDistribution().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={index === 0 ? '#f59e0b' : '#ef4444'} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Alert resolution status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={getStatusDistribution()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getStatusDistribution().map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS]} 
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Manage and track alert responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {alerts.slice(0, 20).map((alert) => (
                    <div 
                      key={alert.id} 
                      className="flex items-start justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {alert.channel === 'email' && <Mail className="h-4 w-4" />}
                          {alert.channel === 'sms' && <MessageSquare className="h-4 w-4" />}
                          {alert.channel === 'whatsapp' && <Send className="h-4 w-4" />}
                          {alert.channel === 'overall' && <BarChart3 className="h-4 w-4" />}
                          
                          <span className="font-medium capitalize">{alert.channel}</span>
                          <Badge 
                            variant={
                              alert.status === 'resolved' ? 'default' : 
                              alert.status === 'acknowledged' ? 'secondary' : 
                              alert.status === 'ignored' ? 'outline' :
                              'destructive'
                            }
                          >
                            {alert.status}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {alert.alert_type === 'conversion_drop' ? '📉 Conversion Rate' : '💰 Negative ROI'}
                          {' '}dropped to {alert.metric_value.toFixed(2)}% 
                          (threshold: {alert.threshold_value.toFixed(2)}%)
                        </p>
                        
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(alert.sent_at), 'PPpp')}
                        </p>

                        {alert.resolution_notes && (
                          <p className="text-sm mt-2 p-2 bg-muted rounded">
                            <strong>Notes:</strong> {alert.resolution_notes}
                          </p>
                        )}
                      </div>

                      {alert.status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleAlertAction(alert, 'acknowledge')}
                          >
                            Acknowledge
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleAlertAction(alert, 'resolve')}
                          >
                            Resolve
                          </Button>
                        </div>
                      )}

                      {alert.status === 'acknowledged' && (
                        <Button 
                          size="sm"
                          onClick={() => handleAlertAction(alert, 'resolve')}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  ))}

                  {alerts.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No alerts found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'acknowledge' && 'Acknowledge Alert'}
                {actionType === 'resolve' && 'Resolve Alert'}
                {actionType === 'ignore' && 'Ignore Alert'}
              </DialogTitle>
              <DialogDescription>
                {actionType === 'acknowledge' && 'Mark this alert as acknowledged.'}
                {actionType === 'resolve' && 'Mark this alert as resolved and add resolution notes.'}
                {actionType === 'ignore' && 'Mark this alert as ignored.'}
              </DialogDescription>
            </DialogHeader>

            {(actionType === 'resolve' || actionType === 'ignore') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {actionType === 'resolve' ? 'Resolution Notes' : 'Reason for Ignoring'}
                </label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder={
                    actionType === 'resolve' 
                      ? "Describe what you did to resolve this issue..."
                      : "Explain why this alert should be ignored..."
                  }
                  rows={4}
                />
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={confirmAlertAction}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </PageLayout>
    </PageTransition>
  );
}
