import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Mail, CreditCard, GraduationCap, Megaphone } from "lucide-react";

interface Preferences {
  email_receipts: boolean;
  payment_reminders: boolean;
  payment_confirmations: boolean;
  course_access_notifications: boolean;
  marketing_emails: boolean;
}

export function AccountPreferences() {
  const [preferences, setPreferences] = useState<Preferences>({
    email_receipts: true,
    payment_reminders: true,
    payment_confirmations: true,
    course_access_notifications: true,
    marketing_emails: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_account_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setPreferences({
          email_receipts: data.email_receipts ?? true,
          payment_reminders: data.payment_reminders ?? true,
          payment_confirmations: data.payment_confirmations ?? true,
          course_access_notifications: data.course_access_notifications ?? true,
          marketing_emails: data.marketing_emails ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast.error("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("user_account_preferences")
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id"
        });

      if (error) throw error;

      toast.success("Preferences saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof Preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose what notifications you want to receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment & Account Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3 flex-1">
              <Mail className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <Label htmlFor="email_receipts" className="text-base font-medium cursor-pointer">
                  Email Receipts
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive email receipts for all purchases and payments
                </p>
              </div>
            </div>
            <Switch
              id="email_receipts"
              checked={preferences.email_receipts}
              onCheckedChange={() => handleToggle('email_receipts')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3 flex-1">
              <Bell className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <Label htmlFor="payment_reminders" className="text-base font-medium cursor-pointer">
                  Payment Reminders
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Get reminders for pending payments before they expire
                </p>
              </div>
            </div>
            <Switch
              id="payment_reminders"
              checked={preferences.payment_reminders}
              onCheckedChange={() => handleToggle('payment_reminders')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3 flex-1">
              <CreditCard className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <Label htmlFor="payment_confirmations" className="text-base font-medium cursor-pointer">
                  Payment Confirmations
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Instant notifications when payments are processed
                </p>
              </div>
            </div>
            <Switch
              id="payment_confirmations"
              checked={preferences.payment_confirmations}
              onCheckedChange={() => handleToggle('payment_confirmations')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3 flex-1">
              <GraduationCap className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <Label htmlFor="course_access_notifications" className="text-base font-medium cursor-pointer">
                  Course Access Notifications
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Get notified when your courses are ready to access
                </p>
              </div>
            </div>
            <Switch
              id="course_access_notifications"
              checked={preferences.course_access_notifications}
              onCheckedChange={() => handleToggle('course_access_notifications')}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-start gap-3 flex-1">
              <Megaphone className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <Label htmlFor="marketing_emails" className="text-base font-medium cursor-pointer">
                  Marketing Communications
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Stay updated with new courses, offers, and learning resources
                </p>
              </div>
            </div>
            <Switch
              id="marketing_emails"
              checked={preferences.marketing_emails}
              onCheckedChange={() => handleToggle('marketing_emails')}
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button onClick={savePreferences} disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
