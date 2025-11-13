import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NurtureRule {
  id: string;
  name: string;
  score_min: number;
  score_max: number;
  days_since_last_email: number;
  template_id: string;
  active: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const brevoApiKey = Deno.env.get("BREVO_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting lead nurture automation...");

    // Get leads that need nurturing
    const { data: leads, error: leadsError } = await supabase
      .from("lead_scores")
      .select(`
        email,
        name,
        total_score,
        status,
        last_activity
      `)
      .gte("total_score", 25)
      .order("total_score", { ascending: false });

    if (leadsError) {
      throw new Error(`Failed to fetch leads: ${leadsError.message}`);
    }

    console.log(`Found ${leads?.length || 0} leads to process`);

    let sentCount = 0;
    const errors: string[] = [];

    // Process each lead
    for (const lead of leads || []) {
      try {
        // Check if they've received a recent nurture email
        const { data: recentEmails } = await supabase
          .from("email_sends")
          .select("sent_at")
          .eq("email", lead.email)
          .gte("sent_at", new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString())
          .limit(1);

        if (recentEmails && recentEmails.length > 0) {
          console.log(`Skipping ${lead.email} - received email recently`);
          continue;
        }

        // Determine email content based on lead score and templates
        let subject = "";
        let htmlContent = "";
        let template = null;

        if (lead.total_score >= 75 && templateMap.hot) {
          template = templateMap.hot;
        } else if (lead.total_score >= 50 && templateMap.warm) {
          template = templateMap.warm;
        } else if (templateMap.cold) {
          template = templateMap.cold;
        }

        // Use template or fallback to default
        if (template) {
          subject = template.subject;
          htmlContent = template.html_content;
          
          // Replace variables
          subject = subject
            .replaceAll("{{name}}", lead.name || "there")
            .replaceAll("{{email}}", lead.email)
            .replaceAll("{{score}}", lead.total_score.toString())
            .replaceAll("{{status}}", lead.status)
            .replaceAll("{{company}}", "Titans Academy");

          htmlContent = htmlContent
            .replaceAll("{{name}}", lead.name || "there")
            .replaceAll("{{email}}", lead.email)
            .replaceAll("{{score}}", lead.total_score.toString())
            .replaceAll("{{status}}", lead.status)
            .replaceAll("{{company}}", "Titans Academy");
        } else {
          // Fallback to default content
          if (lead.total_score >= 75) {
            subject = `${lead.name ? lead.name + ", " : ""}Ready to Transform Your Career?`;
            htmlContent = `
              <h2>You're Almost There!</h2>
              <p>Hi ${lead.name || "there"},</p>
              <p>We've noticed your strong interest in our courses. Book a free consultation call with our expert advisors.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://gfmhhnynyxvmekhvytgg.supabase.co/contact" style="background: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Book Your Free Call</a>
              </p>
              <p>Best regards,<br>The Titans Team</p>
            `;
          } else if (lead.total_score >= 50) {
            subject = `${lead.name ? lead.name + ", " : ""}Discover What You've Been Missing`;
            htmlContent = `
              <h2>Your Learning Journey Awaits</h2>
              <p>Hi ${lead.name || "there"},</p>
              <p>Based on your interests, we've identified courses that align perfectly with your career goals.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://gfmhhnynyxvmekhvytgg.supabase.co/courses" style="background: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Explore Courses</a>
              </p>
              <p>Best regards,<br>The Titans Team</p>
            `;
          } else {
            subject = `${lead.name ? lead.name + ", " : ""}Free Guide: Career Growth in Compliance`;
            htmlContent = `
              <h2>Build Your Future in Compliance</h2>
              <p>Hi ${lead.name || "there"},</p>
              <p>We've created a comprehensive guide to help you navigate the compliance landscape.</p>
              <p style="text-align: center; margin: 30px 0;">
                <a href="https://gfmhhnynyxvmekhvytgg.supabase.co/resources" style="background: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Free Guide</a>
              </p>
              <p>Best regards,<br>The Titans Team</p>
            `;
          }
        }

        // Send email via Brevo
        const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "api-key": brevoApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sender: { name: "Titans Academy", email: "noreply@titans-academy.com" },
            to: [{ email: lead.email, name: lead.name || "" }],
            subject: subject,
            htmlContent: htmlContent,
            tags: ["lead-nurture", lead.status],
          }),
        });

        if (!brevoResponse.ok) {
          const errorText = await brevoResponse.text();
          throw new Error(`Brevo API error: ${errorText}`);
        }

        const brevoData = await brevoResponse.json();
        console.log(`Email sent to ${lead.email}, messageId: ${brevoData.messageId}`);

        // Track the send
        await supabase.from("email_sends").insert({
          email: lead.email,
          tracking_id: brevoData.messageId,
        });

        // Track behavior
        await supabase.from("user_behaviors").insert({
          email: lead.email,
          behavior_type: "nurture_email_sent",
          score_value: 0,
          behavior_data: { status: lead.status, score: lead.total_score }
        });

        sentCount++;
      } catch (error) {
        const errorMsg = `Error processing ${lead.email}: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`Nurture automation complete. Sent: ${sentCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent_count: sentCount,
        errors: errors.length > 0 ? errors : undefined
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Lead nurture error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
