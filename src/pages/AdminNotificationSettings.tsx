import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bell, Mail, Clock, Send } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NotificationPreferences {
  id?: string;
  admin_user_id: string;
  email: string;
  instant_alerts: boolean;
  daily_digest: boolean;
  digest_time: number;
  notify_new_status: boolean;
  notify_in_progress_status: boolean;
  notify_resolved_status: boolean;
  notify_archived_status: boolean;
  notify_contact_form: boolean;
  notify_quick_contact: boolean;
  notify_feedback: boolean;
}

const AdminNotificationSettings = () => {
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    admin_user_id: user?.id || "",
    email: user?.email || "",
    instant_alerts: true,
    daily_digest: false,
    digest_time: 9,
    notify_new_status: true,
    notify_in_progress_status: false,
    notify_resolved_status: false,
    notify_archived_status: false,
    notify_contact_form: true,
    notify_quick_contact: true,
    notify_feedback: true,
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
    if (isAdmin && user) {
      fetchPreferences();
    }
  }, [isAdmin, user]);

  const fetchPreferences = async () => {
    try {
      // @ts-ignore - Types will be regenerated
      const { data, error } = await supabase
        // @ts-ignore - Types will be regenerated
        .from("admin_notification_preferences")
        .select("*")
        .eq("admin_user_id", user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        // @ts-ignore - Types will be regenerated
        setPreferences(data);
      }
    } catch (error: any) {
      console.error("Error fetching preferences:", error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const prefsData = {
        ...preferences,
        admin_user_id: user.id,
        email: preferences.email || user.email,
      };

      if (preferences.id) {
        // Update existing
        // @ts-ignore - Types will be regenerated
        const { error } = await supabase
          // @ts-ignore - Types will be regenerated
          .from("admin_notification_preferences")
          // @ts-ignore - Types will be regenerated
          .update(prefsData)
          .eq("id", preferences.id);

        if (error) throw error;
      } else {
        // Insert new
        // @ts-ignore - Types will be regenerated
        const { data, error } = await supabase
          // @ts-ignore - Types will be regenerated
          .from("admin_notification_preferences")
          // @ts-ignore - Types will be regenerated
          .insert([prefsData])
          .select()
          .single();

        if (error) throw error;
        // @ts-ignore - Types will be regenerated
        if (data) setPreferences(data);
      }

      toast({
        title: "Settings Saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error: any) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const sendTestNotification = async (type: 'instant' | 'digest') => {
    if (!user?.email) return;

    setIsSendingTest(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-notification', {
        body: { 
          type, 
          email: preferences.email || user.email,
          adminName: user.email.split('@')[0]
        }
      });

      if (error) throw error;

      toast({
        title: "Test Email Sent",
        description: `Test ${type === 'instant' ? 'instant alert' : 'daily digest'} email sent to ${preferences.email || user.email}`,
      });
    } catch (error: any) {
      console.error("Error sending test notification:", error);
      toast({
        title: "Error",
        description: "Failed to send test notification. Please check your preferences are saved.",
        variant: "destructive",
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Notification Settings</h1>
          <p className="text-muted-foreground">Configure how you receive form submission notifications</p>
        </div>

        <div className="max-w-3xl space-y-6">
          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Address
              </CardTitle>
              <CardDescription>Where notifications will be sent</CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                type="email"
                value={preferences.email}
                onChange={(e) => setPreferences({ ...preferences, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </CardContent>
          </Card>

          {/* Instant Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Instant Alerts
              </CardTitle>
              <CardDescription>Get notified immediately when submissions match your criteria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="instant-alerts">Enable instant alerts</Label>
                <Switch
                  id="instant-alerts"
                  checked={preferences.instant_alerts}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, instant_alerts: checked })}
                />
              </div>

              {preferences.instant_alerts && (
                <>
                  <div className="pt-4 border-t space-y-3">
                    <p className="text-sm font-medium">Notify me for these statuses:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-new">New submissions</Label>
                        <Switch
                          id="notify-new"
                          checked={preferences.notify_new_status}
                          onCheckedChange={(checked) => setPreferences({ ...preferences, notify_new_status: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-in-progress">In Progress submissions</Label>
                        <Switch
                          id="notify-in-progress"
                          checked={preferences.notify_in_progress_status}
                          onCheckedChange={(checked) => setPreferences({ ...preferences, notify_in_progress_status: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-resolved">Resolved submissions</Label>
                        <Switch
                          id="notify-resolved"
                          checked={preferences.notify_resolved_status}
                          onCheckedChange={(checked) => setPreferences({ ...preferences, notify_resolved_status: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-archived">Archived submissions</Label>
                        <Switch
                          id="notify-archived"
                          checked={preferences.notify_archived_status}
                          onCheckedChange={(checked) => setPreferences({ ...preferences, notify_archived_status: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <p className="text-sm font-medium">Notify me for these form types:</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-contact">Contact Form</Label>
                        <Switch
                          id="notify-contact"
                          checked={preferences.notify_contact_form}
                          onCheckedChange={(checked) => setPreferences({ ...preferences, notify_contact_form: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-quick">Quick Contact</Label>
                        <Switch
                          id="notify-quick"
                          checked={preferences.notify_quick_contact}
                          onCheckedChange={(checked) => setPreferences({ ...preferences, notify_quick_contact: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="notify-feedback">Feedback</Label>
                        <Switch
                          id="notify-feedback"
                          checked={preferences.notify_feedback}
                          onCheckedChange={(checked) => setPreferences({ ...preferences, notify_feedback: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Daily Digest */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Daily Digest
              </CardTitle>
              <CardDescription>Receive a summary of all submissions once per day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="daily-digest">Enable daily digest</Label>
                <Switch
                  id="daily-digest"
                  checked={preferences.daily_digest}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, daily_digest: checked })}
                />
              </div>

              {preferences.daily_digest && (
                <div className="pt-4 border-t">
                  <Label htmlFor="digest-time">Send digest at:</Label>
                  <Select
                    value={preferences.digest_time.toString()}
                    onValueChange={(value) => setPreferences({ ...preferences, digest_time: parseInt(value) })}
                  >
                    <SelectTrigger id="digest-time" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {i.toString().padStart(2, '0')}:00 ({i < 12 ? 'AM' : 'PM'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                <CardTitle>Test Notifications</CardTitle>
              </div>
              <CardDescription>
                Send test emails to verify your notification preferences are working correctly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Test Instant Alert</p>
                    <p className="text-sm text-muted-foreground">
                      Send a sample new submission notification
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => sendTestNotification('instant')}
                    disabled={isSendingTest}
                  >
                    {isSendingTest ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Bell className="h-4 w-4 mr-2" />
                        Send Test
                      </>
                    )}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Test Daily Digest</p>
                    <p className="text-sm text-muted-foreground">
                      Send a sample daily summary email
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => sendTestNotification('digest')}
                    disabled={isSendingTest}
                  >
                    {isSendingTest ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Test
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  💡 Test emails will be sent to: <strong>{preferences.email || user?.email}</strong>
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                  Make sure to save your preferences before sending test emails to see the latest settings reflected.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/admin/form-submissions")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Preferences
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminNotificationSettings;
