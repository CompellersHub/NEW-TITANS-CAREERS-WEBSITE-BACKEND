import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AlertThresholds {
  abandonmentRate: number; // percentage
  fieldErrorCount: number; // absolute count
  minimumSessions: number; // minimum sessions before alerting
}

interface FormAlert {
  formName: string;
  alertType: "abandonment" | "field_errors";
  metric: string;
  value: number;
  threshold: number;
  details: string;
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  abandonmentRate: 30, // 30%
  fieldErrorCount: 10, // 10 errors
  minimumSessions: 5, // Need at least 5 sessions before alerting
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Starting form analytics alert check...");

    // Get analytics data from the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const { data: recentAnalytics, error: analyticsError } = await supabase
      .from("form_analytics")
      .select("*")
      .gte("created_at", twentyFourHoursAgo.toISOString());

    if (analyticsError) {
      throw new Error(`Error fetching analytics: ${analyticsError.message}`);
    }

    console.log(`Found ${recentAnalytics?.length || 0} analytics records in the last 24 hours`);

    const alerts: FormAlert[] = [];

    // Group analytics by form and calculate metrics
    const formGroups = (recentAnalytics || []).reduce((acc, record) => {
      if (!acc[record.form_name]) {
        acc[record.form_name] = {
          sessions: new Set(),
          stepAbandons: 0,
          stepCompletes: 0,
          formCompletes: 0,
          fieldErrors: {} as Record<string, { count: number; errors: string[] }>,
        };
      }

      acc[record.form_name].sessions.add(record.session_id);

      if (record.event_type === "step_abandon") {
        acc[record.form_name].stepAbandons++;
      } else if (record.event_type === "step_complete") {
        acc[record.form_name].stepCompletes++;
      } else if (record.event_type === "form_complete") {
        acc[record.form_name].formCompletes++;
      } else if (record.event_type === "field_error" && record.field_name) {
        if (!acc[record.form_name].fieldErrors[record.field_name]) {
          acc[record.form_name].fieldErrors[record.field_name] = { count: 0, errors: [] };
        }
        acc[record.form_name].fieldErrors[record.field_name].count++;
        if (record.error_message) {
          acc[record.form_name].fieldErrors[record.field_name].errors.push(record.error_message);
        }
      }

      return acc;
    }, {} as Record<string, any>);

// Check each form for threshold violations
const entries = Object.entries(formGroups) as [string, any][];
for (const [formName, metrics] of entries) {
  const uniqueSessions = metrics.sessions.size;

      // Skip if not enough data
      if (uniqueSessions < DEFAULT_THRESHOLDS.minimumSessions) {
        console.log(`Skipping ${formName}: only ${uniqueSessions} sessions (minimum ${DEFAULT_THRESHOLDS.minimumSessions})`);
        continue;
      }

      // Check abandonment rate
      const totalInteractions = metrics.stepAbandons + metrics.stepCompletes;
      if (totalInteractions > 0) {
        const abandonmentRate = (metrics.stepAbandons / totalInteractions) * 100;

        if (abandonmentRate > DEFAULT_THRESHOLDS.abandonmentRate) {
          alerts.push({
            formName,
            alertType: "abandonment",
            metric: "Abandonment Rate",
            value: abandonmentRate,
            threshold: DEFAULT_THRESHOLDS.abandonmentRate,
            details: `${metrics.stepAbandons} abandons out of ${totalInteractions} interactions (${uniqueSessions} unique sessions)`,
          });
          console.log(`🚨 Alert: ${formName} has ${abandonmentRate.toFixed(1)}% abandonment rate`);
        }
      }

      // Check field error rates
      for (const [fieldName, fieldData] of Object.entries(metrics.fieldErrors)) {
        const errorCount = (fieldData as any).count;
        if (errorCount >= DEFAULT_THRESHOLDS.fieldErrorCount) {
          const topErrors = [...new Set((fieldData as any).errors)].slice(0, 3);
          alerts.push({
            formName,
            alertType: "field_errors",
            metric: `Field: ${fieldName}`,
            value: errorCount,
            threshold: DEFAULT_THRESHOLDS.fieldErrorCount,
            details: `Top errors: ${topErrors.join(", ")}`,
          });
          console.log(`🚨 Alert: ${formName} field "${fieldName}" has ${errorCount} errors`);
        }
      }
    }

    // If no alerts, return early
    if (alerts.length === 0) {
      console.log("✅ No alerts triggered");
      return new Response(
        JSON.stringify({ message: "No alerts triggered", checked: Object.keys(formGroups).length }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get admin emails to notify
    const { data: admins, error: adminsError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminsError) {
      console.error("Error fetching admins:", adminsError);
    }

    // For now, send to a default admin email (you can update this)
    const adminEmail = "admin@yourdomain.com"; // TODO: Update with actual admin email

    // Generate email content
    const emailHtml = generateAlertEmail(alerts);

// Send email alert via Resend REST API
try {
  if (!RESEND_API_KEY) throw new Error("Missing RESEND_API_KEY secret");
  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Form Analytics <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `⚠️ Form Analytics Alert: ${alerts.length} Issue${alerts.length > 1 ? "s" : ""} Detected`,
      html: emailHtml,
    }),
  });
  const emailResult = await emailResponse.json();
  if (!emailResponse.ok) {
    console.error("Resend API error:", emailResult);
  } else {
    console.log("Alert email sent successfully:", emailResult);
  }
} catch (emailError: any) {
  console.error("Error sending email:", emailError);
  // Don't throw - we still want to return success if analytics check worked
}

    return new Response(
      JSON.stringify({
        success: true,
        alertsTriggered: alerts.length,
        alerts,
        message: `${alerts.length} alert(s) sent to admins`,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in form-analytics-alerts function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateAlertEmail(alerts: FormAlert[]): string {
  const alertsByForm = alerts.reduce((acc, alert) => {
    if (!acc[alert.formName]) {
      acc[alert.formName] = [];
    }
    acc[alert.formName].push(alert);
    return acc;
  }, {} as Record<string, FormAlert[]>);

  const formSections = Object.entries(alertsByForm)
    .map(
      ([formName, formAlerts]) => `
    <div style="margin-bottom: 30px; padding: 20px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 4px;">
      <h2 style="margin-top: 0; color: #dc2626; font-size: 18px;">
        ${formName.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
      </h2>
      ${formAlerts
        .map(
          (alert) => `
        <div style="margin: 15px 0; padding: 15px; background-color: white; border-radius: 4px;">
          <div style="display: flex; align-items: center; margin-bottom: 10px;">
            <span style="font-weight: bold; color: #dc2626; font-size: 16px;">
              ${alert.alertType === "abandonment" ? "📉" : "❌"} ${alert.metric}
            </span>
          </div>
          <div style="color: #666; margin-bottom: 5px;">
            <strong>Current Value:</strong> ${
              alert.alertType === "abandonment" 
                ? `${alert.value.toFixed(1)}%` 
                : alert.value
            }
          </div>
          <div style="color: #666; margin-bottom: 5px;">
            <strong>Threshold:</strong> ${
              alert.alertType === "abandonment" 
                ? `${alert.threshold}%` 
                : alert.threshold
            }
          </div>
          <div style="color: #666; margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
            ${alert.details}
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Form Analytics Alert</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0;">
            ${alerts.length} issue${alerts.length > 1 ? "s" : ""} detected in the last 24 hours
          </p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
          <p style="margin-top: 0; color: #666;">
            The following forms have exceeded alert thresholds:
          </p>
          
          ${formSections}
          
          <div style="margin-top: 30px; padding: 20px; background-color: #eff6ff; border-radius: 4px; border-left: 4px solid #3b82f6;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 16px;">📊 Recommended Actions</h3>
            <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
              <li>Review form fields with high error rates for clarity and validation logic</li>
              <li>Simplify forms with high abandonment rates by removing unnecessary fields</li>
              <li>Add inline help text or examples for problematic fields</li>
              <li>Consider breaking long forms into multiple steps</li>
              <li>Review the full analytics dashboard for detailed insights</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <a href="${Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovableproject.com")}/form-analytics" 
               style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
              View Full Analytics Dashboard
            </a>
          </div>
          
          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 30px;">
            This is an automated alert from your form analytics system.<br>
            You're receiving this because you're an administrator.
          </p>
        </div>
      </body>
    </html>
  `;
}

serve(handler);
