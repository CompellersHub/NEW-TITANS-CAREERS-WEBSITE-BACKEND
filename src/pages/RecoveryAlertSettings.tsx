import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Bell, Mail, MessageSquare, Send, TrendingDown, DollarSign, MessageCircle, Brain, ArrowRight } from "lucide-react";

export default function RecoveryAlertSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [settings, setSettings] = useState({
    id: '',
    admin_email: '',
    enabled: true,
    email_conversion_threshold: 5.0,
    sms_conversion_threshold: 8.0,
    whatsapp_conversion_threshold: 10.0,
    overall_conversion_threshold: 7.0,
    email_roi_threshold: 0,
    sms_roi_threshold: 0,
    whatsapp_roi_threshold: 0,
    overall_roi_threshold: 0,
    check_interval_hours: 24,
    alert_cooldown_hours: 6,
    slack_webhook_url: '',
    slack_enabled: false,
  });

  useEffect(() => {
    checkAdminAndLoadSettings();
  }, []);

  const checkAdminAndLoadSettings = async () => {
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

      // Load existing settings
      const { data: existingSettings } = await supabase
        .from('recovery_alert_settings' as any)
        .select('*')
        .single();

      if (existingSettings) {
        setSettings(existingSettings as any);
      } else {
        // Set default admin email
        setSettings(prev => ({ ...prev, admin_email: user.email || '' }));
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      if (settings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('recovery_alert_settings' as any)
          .update({
            admin_email: settings.admin_email,
            enabled: settings.enabled,
            email_conversion_threshold: settings.email_conversion_threshold,
            sms_conversion_threshold: settings.sms_conversion_threshold,
            whatsapp_conversion_threshold: settings.whatsapp_conversion_threshold,
            overall_conversion_threshold: settings.overall_conversion_threshold,
            email_roi_threshold: settings.email_roi_threshold,
            sms_roi_threshold: settings.sms_roi_threshold,
            whatsapp_roi_threshold: settings.whatsapp_roi_threshold,
            overall_roi_threshold: settings.overall_roi_threshold,
            check_interval_hours: settings.check_interval_hours,
            alert_cooldown_hours: settings.alert_cooldown_hours,
            slack_webhook_url: settings.slack_webhook_url,
            slack_enabled: settings.slack_enabled,
          } as any)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('recovery_alert_settings' as any)
          .insert([settings] as any)
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setSettings(data as any);
        }
      }

      toast({
        title: "Settings Saved",
        description: "Recovery alert settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestAlert = async () => {
    setTesting(true);
    try {
      const { error } = await supabase.functions.invoke('check-recovery-alerts');

      if (error) throw error;

      toast({
        title: "Test Alert Sent",
        description: "Check your email for the test alert (if thresholds are breached).",
      });
    } catch (error: any) {
      console.error('Error testing alert:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send test alert",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
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
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <Alert variant="destructive">
            <AlertDescription>
              You do not have permission to access this page. Admin access required.
            </AlertDescription>
          </Alert>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Recovery Alert Settings</h1>
            <p className="text-muted-foreground">
              Configure automated alerts for conversion rate drops and negative ROI
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/predictive-analytics')}>
              <Brain className="mr-2 h-4 w-4" />
              Predictive Analytics
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/alert-analytics')}>
              <Bell className="mr-2 h-4 w-4" />
              Alert Analytics
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Configure basic alert preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive automated email alerts when thresholds are breached
                  </p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_email">Admin Email</Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={settings.admin_email}
                  onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                  placeholder="admin@example.com"
                />
                <p className="text-sm text-muted-foreground">
                  Email address to receive alert notifications
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check_interval">Check Interval (hours)</Label>
                  <Input
                    id="check_interval"
                    type="number"
                    min="1"
                    max="168"
                    value={settings.check_interval_hours}
                    onChange={(e) => setSettings({ ...settings, check_interval_hours: parseInt(e.target.value) })}
                  />
                  <p className="text-sm text-muted-foreground">
                    How often to check metrics (1-168 hours)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cooldown">Alert Cooldown (hours)</Label>
                  <Input
                    id="cooldown"
                    type="number"
                    min="1"
                    max="72"
                    value={settings.alert_cooldown_hours}
                    onChange={(e) => setSettings({ ...settings, alert_cooldown_hours: parseInt(e.target.value) })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum time between repeat alerts (1-72 hours)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conversion Rate Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Conversion Rate Thresholds
              </CardTitle>
              <CardDescription>
                Alert when conversion rates drop below these percentages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email_conv" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Threshold (%)
                  </Label>
                  <Input
                    id="email_conv"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.email_conversion_threshold}
                    onChange={(e) => setSettings({ ...settings, email_conversion_threshold: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sms_conv" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS Threshold (%)
                  </Label>
                  <Input
                    id="sms_conv"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.sms_conversion_threshold}
                    onChange={(e) => setSettings({ ...settings, sms_conversion_threshold: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_conv" className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    WhatsApp Threshold (%)
                  </Label>
                  <Input
                    id="whatsapp_conv"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.whatsapp_conversion_threshold}
                    onChange={(e) => setSettings({ ...settings, whatsapp_conversion_threshold: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overall_conv">Overall Threshold (%)</Label>
                  <Input
                    id="overall_conv"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.overall_conversion_threshold}
                    onChange={(e) => setSettings({ ...settings, overall_conversion_threshold: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ROI Thresholds */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                ROI Thresholds
              </CardTitle>
              <CardDescription>
                Alert when ROI falls below these percentages (use 0 for negative ROI alerts)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email_roi" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email ROI (%)
                  </Label>
                  <Input
                    id="email_roi"
                    type="number"
                    step="0.1"
                    value={settings.email_roi_threshold}
                    onChange={(e) => setSettings({ ...settings, email_roi_threshold: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sms_roi" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    SMS ROI (%)
                  </Label>
                  <Input
                    id="sms_roi"
                    type="number"
                    step="0.1"
                    value={settings.sms_roi_threshold}
                    onChange={(e) => setSettings({ ...settings, sms_roi_threshold: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_roi" className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    WhatsApp ROI (%)
                  </Label>
                  <Input
                    id="whatsapp_roi"
                    type="number"
                    step="0.1"
                    value={settings.whatsapp_roi_threshold}
                    onChange={(e) => setSettings({ ...settings, whatsapp_roi_threshold: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overall_roi">Overall ROI (%)</Label>
                  <Input
                    id="overall_roi"
                    type="number"
                    step="0.1"
                    value={settings.overall_roi_threshold}
                    onChange={(e) => setSettings({ ...settings, overall_roi_threshold: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Slack Integration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Slack Integration
              </CardTitle>
              <CardDescription>
                Send real-time alerts to your team's Slack channel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Slack Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Send instant notifications to Slack when thresholds are breached
                  </p>
                </div>
                <Switch
                  checked={settings.slack_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, slack_enabled: checked })}
                />
              </div>

              {settings.slack_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="slack_webhook">Slack Webhook URL</Label>
                  <Input
                    id="slack_webhook"
                    type="url"
                    value={settings.slack_webhook_url}
                    onChange={(e) => setSettings({ ...settings, slack_webhook_url: e.target.value })}
                    placeholder="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
                  />
                  <p className="text-sm text-muted-foreground">
                    Create an incoming webhook in your Slack workspace settings
                  </p>
                </div>
              )}

              {settings.slack_enabled && !settings.slack_webhook_url && (
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Setup Required:</strong> To use Slack alerts, you need to create an 
                    incoming webhook in your Slack workspace. Go to Slack → Apps → Incoming Webhooks → 
                    Add to Slack → Choose a channel → Copy the webhook URL.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex-1"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
            <Button
              onClick={handleTestAlert}
              disabled={testing || !settings.enabled}
              variant="outline"
            >
              {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Alert Now
            </Button>
          </div>

          {/* Info */}
          <Alert>
            <Bell className="h-4 w-4" />
            <AlertDescription>
              <strong>Automated Checking:</strong> The system checks metrics every{' '}
              {settings.check_interval_hours} hour(s) based on the last 24 hours of data.
              Set up a cron job to automatically trigger the check-recovery-alerts function.
            </AlertDescription>
          </Alert>
        </div>
      </div>
      <Footer />
    </PageTransition>
  );
}
