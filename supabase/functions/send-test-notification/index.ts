import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestNotificationRequest {
  type: 'instant' | 'digest';
  email: string;
  adminName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, adminName }: TestNotificationRequest = await req.json();
    
    console.log(`Sending test ${type} notification to ${email}`);

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let htmlContent = '';
    let subject = '';

    if (type === 'instant') {
      subject = '[TEST] New Form Submission Alert';
      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Notification</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📬 Test Instant Alert</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${adminName || 'Admin'},</p>
            
            <p style="margin-bottom: 20px;">This is a test instant alert notification. If you're receiving this, your instant alert notifications are configured correctly!</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px;">Test Submission Details</h2>
              <p style="margin: 8px 0;"><strong>Form Type:</strong> <span style="background: #dbeafe; padding: 4px 8px; border-radius: 4px;">Contact Form</span></p>
              <p style="margin: 8px 0;"><strong>Status:</strong> <span style="background: #dbeafe; padding: 4px 8px; border-radius: 4px;">New</span></p>
              <p style="margin: 8px 0;"><strong>From:</strong> test@example.com</p>
              <p style="margin: 8px 0;"><strong>Message:</strong> This is a test message to verify the instant alert system is working.</p>
              <p style="margin: 8px 0; color: #6b7280; font-size: 14px;"><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              This is a test notification. No action is required. You can safely ignore this email.
            </p>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${supabaseUrl.replace('https://', 'https://').split('.supabase.co')[0]}.lovableproject.com/admin/form-submissions" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                View All Submissions
              </a>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Titans Training Hub Admin Notification System</p>
          </div>
        </body>
        </html>
      `;
    } else {
      // Digest type
      subject = '[TEST] Daily Digest Summary';
      
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Daily Digest</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📊 Test Daily Digest</h1>
            <p style="color: white; opacity: 0.9; margin: 10px 0 0 0;">${yesterday.toLocaleDateString()} - ${now.toLocaleDateString()}</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${adminName || 'Admin'},</p>
            
            <p style="margin-bottom: 20px;">This is a test daily digest notification. If you're receiving this, your daily digest notifications are configured correctly!</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px;">Summary by Status</h2>
              <div style="background-color: #f3f4f6; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px;">
                <strong>New:</strong> 5 submissions
              </div>
              <div style="background-color: #f3f4f6; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px;">
                <strong>In Progress:</strong> 3 submissions
              </div>
              <div style="background-color: #f3f4f6; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px;">
                <strong>Resolved:</strong> 12 submissions
              </div>
            </div>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px;">Summary by Form Type</h2>
              <div style="background-color: #f3f4f6; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px;">
                <strong>Contact Form:</strong> 12 submissions
              </div>
              <div style="background-color: #f3f4f6; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px;">
                <strong>Quick Contact:</strong> 6 submissions
              </div>
              <div style="background-color: #f3f4f6; padding: 10px 15px; border-radius: 5px; margin-bottom: 10px;">
                <strong>Feedback:</strong> 2 submissions
              </div>
            </div>

            <div style="background: #fff7ed; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
              <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">📌 Recent Submissions</h3>
              <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #fed7aa;">
                <p style="margin: 5px 0;"><strong>Contact Form</strong> from john.doe@example.com</p>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Status: New • 2 hours ago</p>
              </div>
              <div style="margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #fed7aa;">
                <p style="margin: 5px 0;"><strong>Quick Contact</strong> from jane.smith@example.com</p>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Status: New • 5 hours ago</p>
              </div>
              <div style="margin: 10px 0; padding: 10px 0;">
                <p style="margin: 5px 0;"><strong>Feedback</strong> from feedback@example.com</p>
                <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">Status: New • 8 hours ago</p>
              </div>
            </div>

            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
              This is a test notification. The data shown above is sample data for demonstration purposes.
            </p>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${supabaseUrl.replace('https://', 'https://').split('.supabase.co')[0]}.lovableproject.com/admin/form-submissions" 
                 style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                View All Submissions
              </a>
            </div>
          </div>
          
          <div style="margin-top: 20px; text-align: center; color: #6b7280; font-size: 12px;">
            <p>Titans Training Hub Admin Notification System</p>
          </div>
        </body>
        </html>
      `;
    }

    // Send email via Brevo
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
        body: JSON.stringify({
          sender: {
            name: "Titans Careers",
            email: "newsletter@titanscareers.com",
          },
        to: [{ email, name: adminName }],
        subject,
        htmlContent,
      }),
    });

    if (!brevoResponse.ok) {
      const errorText = await brevoResponse.text();
      console.error("Brevo API error:", errorText);
      throw new Error(`Failed to send email: ${brevoResponse.status} ${errorText}`);
    }

    const result = await brevoResponse.json();
    console.log("Test notification sent successfully:", result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Test ${type} notification sent successfully to ${email}`,
        messageId: result.messageId 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-test-notification function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
