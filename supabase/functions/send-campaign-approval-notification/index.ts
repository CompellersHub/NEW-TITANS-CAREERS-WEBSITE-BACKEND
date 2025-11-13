import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApprovalNotificationRequest {
  campaignId: string;
  campaignSubject: string;
  recipientCount: number;
  scheduledTime: string;
  voucherCode: string;
  submitterEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaignId, campaignSubject, recipientCount, scheduledTime, voucherCode, submitterEmail }: ApprovalNotificationRequest = await req.json();

    console.log("Processing approval notification for campaign:", campaignId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all admin users
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) {
      console.error("Error fetching admin roles:", rolesError);
      throw rolesError;
    }

    if (!adminRoles || adminRoles.length === 0) {
      console.log("No admin users found");
      return new Response(
        JSON.stringify({ message: "No admin users to notify" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get admin emails from auth.users
    const adminUserIds = adminRoles.map(r => r.user_id);
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      throw usersError;
    }

    const adminEmails = users
      .filter(user => adminUserIds.includes(user.id) && user.email)
      .map(user => user.email!);

    if (adminEmails.length === 0) {
      console.log("No admin email addresses found");
      return new Response(
        JSON.stringify({ message: "No admin email addresses found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Sending approval notifications to ${adminEmails.length} admins`);

    const scheduledDate = new Date(scheduledTime).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short',
    });

    // Send email to all admins
    const emailPromises = adminEmails.map(email =>
      resend.emails.send({
        from: "Titans Academy <onboarding@resend.dev>",
        to: [email],
        subject: "🔔 New Campaign Awaiting Approval",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Campaign Approval Required</h1>
              </div>
              
              <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                  A new voucher campaign has been submitted and requires your approval before it can be scheduled.
                </p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
                  <h2 style="margin-top: 0; color: #667eea; font-size: 18px;">Campaign Details</h2>
                  
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #666;">Subject:</td>
                      <td style="padding: 8px 0;">${campaignSubject}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #666;">Voucher Code:</td>
                      <td style="padding: 8px 0;"><code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${voucherCode}</code></td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #666;">Recipients:</td>
                      <td style="padding: 8px 0;">${recipientCount} people</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #666;">Scheduled For:</td>
                      <td style="padding: 8px 0;">${scheduledDate}</td>
                    </tr>
                    ${submitterEmail ? `
                    <tr>
                      <td style="padding: 8px 0; font-weight: 600; color: #666;">Submitted By:</td>
                      <td style="padding: 8px 0;">${submitterEmail}</td>
                    </tr>
                    ` : ''}
                  </table>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${supabaseUrl.replace('https://gfmhhnynyxvmekhvytgg.supabase.co', 'https://ab96de06-e0d0-424a-9c52-b844b1bee573.lovableproject.com')}/admin/campaign-approval" 
                     style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                    Review Campaign
                  </a>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 14px;">
                  <p>This campaign will remain in pending status until approved or rejected.</p>
                  <p style="margin-top: 10px;">
                    <a href="${supabaseUrl.replace('https://gfmhhnynyxvmekhvytgg.supabase.co', 'https://ab96de06-e0d0-424a-9c52-b844b1bee573.lovableproject.com')}/admin/campaign-approval" style="color: #667eea; text-decoration: none;">View Approval Queue</a>
                  </p>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                <p>© ${new Date().getFullYear()} Titans Academy. All rights reserved.</p>
              </div>
            </body>
          </html>
        `,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    console.log(`Email results: ${successCount} sent successfully, ${failureCount} failed`);

    // Log any failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send to ${adminEmails[index]}:`, result.reason);
      }
    });

    return new Response(
      JSON.stringify({
        success: true,
        sentTo: successCount,
        failed: failureCount,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-campaign-approval-notification function:", error);
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
