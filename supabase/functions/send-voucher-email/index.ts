import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendVoucherRequest {
  voucherId: string;
  recipients: string[];
  segmentId?: string;
  subject?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { voucherId, recipients, segmentId, subject, message }: SendVoucherRequest = await req.json();

    console.log("Sending voucher email:", { voucherId, recipientCount: recipients.length, segmentId });

    // Fetch voucher details
    const { data: voucher, error: voucherError } = await supabase
      .from("vouchers")
      .select("*")
      .eq("id", voucherId)
      .single();

    if (voucherError || !voucher) {
      throw new Error("Voucher not found");
    }

    // Get recipients from segment if specified
    let emailList = recipients;
    if (segmentId && emailList.length === 0) {
      const { data: segment } = await supabase
        .from("subscriber_segments")
        .select("*")
        .eq("id", segmentId)
        .single();

      if (segment) {
        const { data: subscribers } = await supabase
          .from("newsletter_subscribers")
          .select("email, tags, engagement_score")
          .eq("active", true);

        if (subscribers) {
          console.log(`Filtering ${subscribers.length} subscribers for segment:`, {
            tags_include: segment.tags_include,
            tags_exclude: segment.tags_exclude,
            min_engagement: segment.min_engagement_score,
            max_engagement: segment.max_engagement_score
          });

          // Apply segment filters (matching get_segment_count function logic)
          emailList = subscribers
            .filter((sub: any) => {
              // Check tags_include: empty array means no filter, otherwise must have overlap
              const hasRequiredTags = segment.tags_include.length === 0 || 
                (sub.tags && sub.tags.some((tag: string) => segment.tags_include.includes(tag)));
              
              // Check tags_exclude: empty array means no filter, otherwise must NOT have overlap
              const hasNoExcludedTags = segment.tags_exclude.length === 0 || 
                !sub.tags || !sub.tags.some((tag: string) => segment.tags_exclude.includes(tag));
              
              // Check engagement score range
              const meetsEngagement = sub.engagement_score >= segment.min_engagement_score &&
                sub.engagement_score <= segment.max_engagement_score;
              
              return hasRequiredTags && hasNoExcludedTags && meetsEngagement;
            })
            .map((sub: any) => sub.email);

          console.log(`Filtered down to ${emailList.length} matching subscribers`);
        }
      }
    }

    if (emailList.length === 0) {
      throw new Error("No recipients found");
    }

    console.log(`Sending to ${emailList.length} recipients`);

    // Batch process emails (send in groups of 50 to avoid rate limits)
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < emailList.length; i += batchSize) {
      batches.push(emailList.slice(i, i + batchSize));
    }

    let totalSent = 0;
    let totalFailed = 0;
    const trackingRecords: Array<{
      voucher_id: string;
      recipient_email: string;
      tracking_id: string;
      sent_at: string;
      status: string;
    }> = [];

    for (const batch of batches) {
      const sendPromises = batch.map(async (recipientEmail) => {
        try {
          // Generate unique tracking ID for this send
          const trackingId = crypto.randomUUID();
          
          // Create email send tracking record
          const { data: sendRecord, error: sendError } = await supabase
            .from("email_sends")
            .insert({
              email: recipientEmail,
              tracking_id: trackingId,
            })
            .select()
            .single();

          if (sendError) {
            console.error("Error creating send record:", sendError);
            throw sendError;
          }

          // Create HTML email template with tracking
          const discountText = voucher.discount_type === "percentage"
            ? `${voucher.discount_value}% OFF`
            : `$${voucher.discount_value} OFF`;

          const expiryText = voucher.expires_at 
            ? `Expires: ${new Date(voucher.expires_at).toLocaleDateString()}`
            : "No expiration";

          const courseText = voucher.course_id 
            ? `Valid for specific course`
            : "Valid for any course";

          // Build tracking URLs
          const trackingPixelUrl = `${supabaseUrl}/functions/v1/track-email-open?id=${trackingId}`;
          const coursesUrl = `${supabaseUrl}/functions/v1/track-email-click?id=${trackingId}&url=${encodeURIComponent(`${supabaseUrl?.replace('.supabase.co', '') || ''}/courses`)}`;

          const htmlContent = `
<!DOCTYPE html>
<html>
  <head>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
      .content { background: #ffffff; padding: 40px 20px; border: 1px solid #e0e0e0; }
      .voucher-code { background: #f8f9fa; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 30px 0; border-radius: 8px; }
      .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: monospace; }
      .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e0e0e0; }
      .detail-label { font-weight: 600; color: #666; }
      .detail-value { color: #333; }
      .cta { text-align: center; margin: 30px 0; }
      .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: 600; }
      .footer { text-align: center; color: #999; font-size: 14px; padding: 20px; }
      .message { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 style="margin: 0; font-size: 28px;">🎉 Your Exclusive Voucher</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Special discount just for you!</p>
      </div>
      <div class="content">
        ${message ? `<div class="message">${message}</div>` : ''}
        
        <p>We're excited to share this exclusive voucher code with you!</p>
        
        <div class="voucher-code">
          <div style="color: #666; font-size: 14px; margin-bottom: 10px;">YOUR VOUCHER CODE</div>
          <div class="code">${voucher.code}</div>
          <div style="color: #666; font-size: 14px; margin-top: 10px;">Copy and paste this code at checkout</div>
        </div>
        
        <div class="details">
          <div class="detail-row">
            <span class="detail-label">Discount:</span>
            <span class="detail-value" style="color: #28a745; font-weight: bold;">${discountText}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Applicability:</span>
            <span class="detail-value">${courseText}</span>
          </div>
          ${voucher.usage_limit ? `
          <div class="detail-row">
            <span class="detail-label">Usage Limit:</span>
            <span class="detail-value">${voucher.usage_limit} time(s)</span>
          </div>
          ` : ''}
          <div class="detail-row" style="border: none;">
            <span class="detail-label">Valid Until:</span>
            <span class="detail-value">${expiryText}</span>
          </div>
        </div>
        
        <div class="cta">
          <a href="${coursesUrl}" class="button">Browse Courses</a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Questions? Contact our support team at support@example.com
        </p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Titans Careers. All rights reserved.</p>
        <p style="font-size: 12px; margin-top: 10px;">You received this email because you're a valued subscriber.</p>
      </div>
    </div>
    <!-- Tracking pixel -->
    <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
  </body>
</html>
          `;

          // Send email via Resend
          const { data: resendData, error: resendError } = await resend.emails.send({
            from: "Titans Careers <courses@titanscareers.com>",
            to: [recipientEmail],
            subject: subject || `Your Exclusive Voucher Code: ${voucher.code}`,
            html: htmlContent,
          });

          if (resendError) {
            console.error(`Failed to send to ${recipientEmail}:`, resendError);
            throw resendError;
          }

          console.log(`Sent to ${recipientEmail}, messageId: ${resendData?.id || 'unknown'}`);

          // Create voucher distribution record
          trackingRecords.push({
            voucher_id: voucherId,
            recipient_email: recipientEmail,
            tracking_id: trackingId,
            sent_at: new Date().toISOString(),
            status: 'sent',
          });

          return { success: true, email: recipientEmail };
        } catch (error: any) {
          console.error(`Error sending to ${recipientEmail}:`, error);
          return { success: false, email: recipientEmail, error: error.message };
        }
      });

      const results = await Promise.all(sendPromises);
      totalSent += results.filter(r => r.success).length;
      totalFailed += results.filter(r => !r.success).length;

      console.log(`Batch complete: ${results.filter(r => r.success).length} sent, ${results.filter(r => !r.success).length} failed`);
    }

    // Insert all voucher distribution records
    if (trackingRecords.length > 0) {
      const { error: distError } = await supabase
        .from("voucher_distributions")
        .insert(trackingRecords);

      if (distError) {
        console.error("Error recording voucher distributions:", distError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        totalSent,
        totalFailed,
        message: `Successfully sent ${totalSent} emails${totalFailed > 0 ? `, ${totalFailed} failed` : ''}`
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-voucher-email function:", error);
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
