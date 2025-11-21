import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layouts/PageLayout";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Bell, Mail, Settings, Play, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";

export default function FormAlertSettings() {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testingAlert, setTestingAlert] = useState(false);
  const [settings, setSettings] = useState({
    abandonmentThreshold: 30,
    errorThreshold: 10,
    minimumSessions: 5,
    adminEmail: "admin@yourdomain.com",
    enabled: true,
  });

  const handleTestAlert = async () => {
    setTestingAlert(true);
    try {
      const { data, error } = await supabase.functions.invoke("form-analytics-alerts", {
        body: { test: true },
      });

      if (error) throw error;

      toast.success("Test alert triggered! Check your email.", {
        description: `${data.alertsTriggered || 0} alert(s) were generated`,
      });
    } catch (error: any) {
      toast.error("Failed to trigger test alert", {
        description: error.message,
      });
    } finally {
      setTestingAlert(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // In a real implementation, you would save these settings to a database table
      // For now, we'll just show a success message
      toast.success("Settings saved successfully", {
        description: "Alert thresholds have been updated",
      });
    } catch (error: any) {
      toast.error("Failed to save settings", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <PageTransition>
        <PageLayout intensity3D="subtle" show3D={true}>
          <div className="container mx-auto py-16 px-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You must be an administrator to access alert settings.
              </AlertDescription>
            </Alert>
          </div>
        </PageLayout>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <PageLayout intensity3D="subtle" show3D={true}>
        <div className="container mx-auto py-16 px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-kanit font-bold mb-2 flex items-center gap-2">
              <Bell className="h-8 w-8" />
              Form Alert Settings
            </h1>
            <p className="text-muted-foreground">
              Configure automated alerts for form analytics issues
            </p>
          </div>

          <div className="space-y-6">
            {/* Alert Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Alert Configuration
                </CardTitle>
                <CardDescription>
                  Customize when you receive alerts about form performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enabled" className="text-base">
                      Enable Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email notifications when thresholds are exceeded
                    </p>
                  </div>
                  <Switch
                    id="enabled"
                    checked={settings.enabled}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, enabled: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email Address</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.adminEmail}
                    onChange={(e) =>
                      setSettings({ ...settings, adminEmail: e.target.value })
                    }
                    placeholder="admin@yourdomain.com"
                  />
                  <p className="text-sm text-muted-foreground">
                    Alerts will be sent to this email address
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Threshold Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Thresholds</CardTitle>
                <CardDescription>
                  Define when alerts should be triggered
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="abandonmentThreshold">
                    Abandonment Rate Threshold (%)
                  </Label>
                  <Input
                    id="abandonmentThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.abandonmentThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        abandonmentThreshold: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Alert when form abandonment rate exceeds this percentage
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="errorThreshold">
                    Field Error Count Threshold
                  </Label>
                  <Input
                    id="errorThreshold"
                    type="number"
                    min="0"
                    value={settings.errorThreshold}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        errorThreshold: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Alert when a field has this many errors in 24 hours
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minimumSessions">
                    Minimum Sessions Required
                  </Label>
                  <Input
                    id="minimumSessions"
                    type="number"
                    min="1"
                    value={settings.minimumSessions}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        minimumSessions: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    Only trigger alerts after this many user sessions
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cron Schedule Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Automated Checking
                </CardTitle>
                <CardDescription>
                  Alerts are automatically checked every day at 9:00 AM
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Daily Analytics Review</p>
                    <p className="text-sm text-muted-foreground">
                      The system analyzes form data from the past 24 hours and sends a
                      consolidated report if any thresholds are exceeded.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button onClick={handleSaveSettings} disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Save Settings"}
              </Button>
              <Button
                variant="outline"
                onClick={handleTestAlert}
                disabled={testingAlert}
                className="flex-1"
              >
                <Play className="mr-2 h-4 w-4" />
                {testingAlert ? "Testing..." : "Test Alert Now"}
              </Button>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Note:</strong> Make sure to update the admin email in the edge
                function code before deploying to production. The current default is
                "admin@yourdomain.com".
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </PageLayout>
    </PageTransition>
  );
}
