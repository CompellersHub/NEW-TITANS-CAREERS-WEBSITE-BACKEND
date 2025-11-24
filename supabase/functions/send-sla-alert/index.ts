import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SLAAlertRequest {
  alert_type: 'approaching' | 'overdue' | 'compliance_low';
  submission_id?: string;
  admin_email: string;
  priority?: string;
  form_type?: string;
  time_remaining?: number;
  overdue_by?: number;
  compliance_rate?: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      alert_type,
      submission_id,
      admin_email,
      priority,
      form_type,
      time_remaining,
      overdue_by,
      compliance_rate
    }: SLAAlertRequest = await req.json();

    console.log('Sending SLA alert:', { alert_type, submission_id, admin_email });

    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    if (!BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY not configured");
    }

    let subject = '';
    let htmlContent = '';

    if (alert_type === 'approaching') {
      const hours = Math.floor((time_remaining || 0) / 3600);
      const minutes = Math.floor(((time_remaining || 0) % 3600) / 60);
      
      subject = `⚠️ SLA Deadline Approaching - ${priority?.toUpperCase()} Priority`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ SLA Deadline Approaching</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              A submission assigned to you is approaching its SLA deadline.
            </p>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-weight: bold;">Time Remaining: ${hours}h ${minutes}m</p>
            </div>
            
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #6b7280;"><strong>Submission ID:</strong> ${submission_id?.substring(0, 8)}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Priority:</strong> ${priority?.toUpperCase()}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Form Type:</strong> ${form_type}</p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
              Please review and respond to this submission as soon as possible to meet the SLA deadline.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://gfmhhnynyxvmekhvytgg.supabase.co/admin/form-submissions" 
                 style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Submission
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated SLA alert from your Form Management System</p>
          </div>
        </div>
      `;
    } else if (alert_type === 'overdue') {
      const hours = Math.floor((overdue_by || 0) / 3600);
      const minutes = Math.floor(((overdue_by || 0) % 3600) / 60);
      
      subject = `🚨 URGENT: SLA Deadline OVERDUE - ${priority?.toUpperCase()} Priority`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚨 SLA DEADLINE OVERDUE</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #374151; line-height: 1.6; font-weight: bold;">
              URGENT: A submission assigned to you has exceeded its SLA deadline!
            </p>
            
            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-weight: bold;">Overdue By: ${hours}h ${minutes}m</p>
            </div>
            
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #6b7280;"><strong>Submission ID:</strong> ${submission_id?.substring(0, 8)}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Priority:</strong> ${priority?.toUpperCase()}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Form Type:</strong> ${form_type}</p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
              Immediate action is required to address this overdue submission and prevent further SLA violations.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://gfmhhnynyxvmekhvytgg.supabase.co/admin/form-submissions" 
                 style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Submission Now
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated urgent SLA alert from your Form Management System</p>
          </div>
        </div>
      `;
    } else if (alert_type === 'compliance_low') {
      subject = `🚨 ALERT: Team SLA Compliance Below Threshold`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">🚨 Low SLA Compliance Alert</h1>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; color: #374151; line-height: 1.6; font-weight: bold;">
              Team SLA compliance has dropped below the 80% threshold.
            </p>
            
            <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-size: 24px; font-weight: bold; text-align: center;">
                Current Compliance: ${compliance_rate?.toFixed(1)}%
              </p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Action Required:</strong> The team's SLA compliance rate has fallen below the acceptable 80% threshold. 
                Please review current submissions and allocate resources to address overdue and approaching deadlines.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
              This alert is based on submissions from the last 7 days. Consider:
            </p>
            
            <ul style="color: #6b7280; line-height: 1.8;">
              <li>Reviewing current workload distribution</li>
              <li>Addressing overdue submissions immediately</li>
              <li>Reassigning high-priority items if needed</li>
              <li>Checking team capacity and availability</li>
            </ul>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://gfmhhnynyxvmekhvytgg.supabase.co/admin/form-analytics" 
                 style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Analytics Dashboard
              </a>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>This is an automated team performance alert from your Form Management System</p>
          </div>
        </div>
      `;
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "Titans Careers", email: "alerts@titanscareers.com" },
        to: [{ email: admin_email }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brevo API error:", errorText);
      throw new Error(`Failed to send email: ${errorText}`);
    }

    const result = await response.json();
    console.log("SLA alert email sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, result }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error sending SLA alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
