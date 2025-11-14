import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Bell, Mail, Clock, Eye } from "lucide-react";
import { DigestPreviewDialog } from "./DigestPreviewDialog";

interface Preferences {
  reply_notifications: boolean;
  mention_notifications: boolean;
  frequency: string;
  digest_time: number;
}

export const NotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Preferences>({
    reply_notifications: true,
    mention_notifications: true,
    frequency: "instant",
    digest_time: 9,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("email_notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setPreferences({
          reply_notifications: data.reply_notifications,
          mention_notifications: data.mention_notifications,
          frequency: data.frequency,
          digest_time: data.digest_time,
        });
      }
    } catch (error: any) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("email_notification_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
        });

      if (error) throw error;

      toast.success("Notification preferences saved");
    } catch (error: any) {
      toast.error("Failed to save preferences", {
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading preferences...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Manage how and when you receive email notifications about course discussions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Types */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold">Email Notifications</h3>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="reply-notifications" className="text-base cursor-pointer">
                Reply Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone replies to your discussion threads
              </p>
            </div>
            <Switch
              id="reply-notifications"
              checked={preferences.reply_notifications}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, reply_notifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="mention-notifications" className="text-base cursor-pointer">
                Mention Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone mentions you using @yourname
              </p>
            </div>
            <Switch
              id="mention-notifications"
              checked={preferences.mention_notifications}
              onCheckedChange={(checked) =>
                setPreferences((prev) => ({ ...prev, mention_notifications: checked }))
              }
            />
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Frequency
          </h3>

          <div className="space-y-3">
            <Label htmlFor="frequency">How often would you like to receive emails?</Label>
            <Select value={preferences.frequency} onValueChange={(value) => setPreferences((prev) => ({ ...prev, frequency: value }))}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">
                  <div className="flex flex-col items-start">
                    <span>Instant</span>
                    <span className="text-xs text-muted-foreground">Get notified immediately</span>
                  </div>
                </SelectItem>
                <SelectItem value="daily">
                  <div className="flex flex-col items-start">
                    <span>Daily Digest</span>
                    <span className="text-xs text-muted-foreground">Once per day summary</span>
                  </div>
                </SelectItem>
                <SelectItem value="weekly">
                  <div className="flex flex-col items-start">
                    <span>Weekly Digest</span>
                    <span className="text-xs text-muted-foreground">Once per week summary</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(preferences.frequency === "daily" || preferences.frequency === "weekly") && (
            <div className="space-y-3">
              <Label htmlFor="digest-time" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Preferred Time
              </Label>
              <Select
                value={preferences.digest_time.toString()}
                onValueChange={(value) => setPreferences((prev) => ({ ...prev, digest_time: parseInt(value) }))}
              >
                <SelectTrigger id="digest-time">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {i.toString().padStart(2, "0")}:00 (
                      {i === 0 ? "Midnight" : i < 12 ? `${i}:00 AM` : i === 12 ? "Noon" : `${i - 12}:00 PM`})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Your {preferences.frequency} digest will be sent at this time
              </p>
            </div>
          )}

          {(preferences.frequency === "daily" || preferences.frequency === "weekly") && (
            <div className="pt-3">
              <Button
                variant="outline"
                onClick={() => setShowPreview(true)}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Digest Email
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>

      <DigestPreviewDialog
        open={showPreview}
        onOpenChange={setShowPreview}
        frequency={preferences.frequency}
        digestTime={preferences.digest_time}
      />
    </Card>
  );
};
