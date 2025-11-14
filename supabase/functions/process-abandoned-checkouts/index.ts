import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const brevoApiKey = Deno.env.get("BREVO_API_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Starting abandoned checkout processor...");

    const now = new Date();
    const results = {
      processed: 0,
      email1_sent: 0,
      email2_sent: 0,
      email3_sent: 0,
      errors: [] as string[],
    };

    // Find abandoned checkouts (not completed, older than timeframes)
    const { data: abandonedSessions, error: sessionsError } = await supabase
      .from("checkout_sessions")
      .select("*")
      .is("completed_at", null)
      .eq("abandoned", false)
      .lt("created_at", new Date(now.getTime() - 60 * 60 * 1000).toISOString()); // At least 1 hour old

    if (sessionsError) {
      throw new Error(`Failed to fetch abandoned sessions: ${sessionsError.message}`);
    }

    console.log(`Found ${abandonedSessions?.length || 0} potentially abandoned sessions`);

    for (const session of abandonedSessions || []) {
      try {
        const sessionAge = now.getTime() - new Date(session.created_at).getTime();
        const hoursOld = sessionAge / (1000 * 60 * 60);

        // Check which emails have been sent
        const { data: sentEmails } = await supabase
          .from("checkout_abandonment_emails")
          .select("email_sequence_number")
          .eq("checkout_session_id", session.id);

        const sentSequences = new Set(sentEmails?.map(e => e.email_sequence_number) || []);

        let emailToSend = null;
        let discountCode = null;

        // Email 1: After 1 hour - Gentle reminder
        if (hoursOld >= 1 && !sentSequences.has(1)) {
          emailToSend = {
            sequence: 1,
            type: "reminder",
            subject: `${session.name ? session.name + ", " : ""}Don't Miss Out on ${session.course_title}!`,
            content: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #FF6B6B;">You're Almost There!</h2>
                <p>Hi ${session.name || "there"},</p>
                <p>We noticed you were interested in enrolling in <strong>${session.course_title}</strong> but didn't complete your checkout.</p>
                <p>Don't worry - we've saved your spot! You can complete your enrollment anytime.</p>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://gfmhhnynyxvmekhvytgg.supabase.co/courses/${session.course_slug}" 
                     style="background: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                    Complete Your Enrollment
                  </a>
                </div>
                <p><strong>What you'll get:</strong></p>
                <ul>
                  <li>Expert-led training</li>
                  <li>Industry-recognized certification</li>
                  <li>Lifetime access to course materials</li>
                  <li>Career support and guidance</li>
                </ul>
                <p>Have questions? Reply to this email - we're here to help!</p>
                <p>Best regards,<br>The Titans Academy Team</p>
              </div>
            `,
          };
        }
        // Email 2: After 24 hours - 10% discount offer
        else if (hoursOld >= 24 && !sentSequences.has(2)) {
          discountCode = "COMEBACK10";
          emailToSend = {
            sequence: 2,
            type: "discount",
            subject: `${session.name ? session.name + ", " : ""}Exclusive 10% OFF ${session.course_title} - Limited Time!`,
            content: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #FF6B6B;">🎉 Special Offer Just For You!</h2>
                <p>Hi ${session.name || "there"},</p>
                <p>We really want you to join <strong>${session.course_title}</strong>!</p>
                <div style="background: #FFF5F5; border-left: 4px solid #FF6B6B; padding: 20px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #FF6B6B;">Get 10% OFF Today!</h3>
                  <p style="font-size: 18px; margin: 10px 0;">Use code: <strong style="font-size: 24px; color: #FF6B6B;">COMEBACK10</strong></p>
                  <p style="margin-bottom: 0; color: #666;">⏰ This offer expires in 48 hours!</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://gfmhhnynyxvmekhvytgg.supabase.co/courses/${session.course_slug}" 
                     style="background: #FF6B6B; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 18px;">
                    Claim Your 10% Discount
                  </a>
                </div>
                <p><strong>Why students love this course:</strong></p>
                <ul>
                  <li>⭐ 4.8/5 average rating</li>
                  <li>📚 Comprehensive curriculum</li>
                  <li>💼 Career-focused training</li>
                  <li>🎓 Industry-recognized certification</li>
                </ul>
                <p>Don't let this opportunity slip away. Invest in your future today!</p>
                <p>Best regards,<br>The Titans Academy Team</p>
              </div>
            `,
          };
        }
        // Email 3: After 72 hours - Final urgency + 15% discount
        else if (hoursOld >= 72 && !sentSequences.has(3)) {
          discountCode = "LASTCHANCE15";
          emailToSend = {
            sequence: 3,
            type: "final",
            subject: `${session.name ? session.name + ", " : ""}⏰ Last Chance: 15% OFF ${session.course_title} Ends Tonight!`,
            content: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #FF6B6B; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
                  <h2 style="margin: 0;">⏰ FINAL CALL: 15% OFF!</h2>
                  <p style="margin: 10px 0 0 0; font-size: 14px;">This is your last chance to save on ${session.course_title}</p>
                </div>
                <div style="padding: 20px;">
                  <p>Hi ${session.name || "there"},</p>
                  <p>This is it - your final opportunity to enroll in <strong>${session.course_title}</strong> at a discount.</p>
                  <div style="background: #FFF5F5; border: 2px dashed #FF6B6B; padding: 20px; margin: 20px 0; text-align: center;">
                    <h3 style="margin-top: 0; color: #FF6B6B;">EXCLUSIVE 15% OFF</h3>
                    <p style="font-size: 28px; margin: 10px 0; font-weight: bold; color: #FF6B6B;">LASTCHANCE15</p>
                    <p style="margin-bottom: 0; color: #666; font-weight: bold;">⚠️ Expires in 24 hours!</p>
                  </div>
                  <p><strong>Original Price:</strong> <span style="text-decoration: line-through;">${session.metadata?.final_price || session.original_price} USD</span></p>
                  <p style="font-size: 20px; color: #FF6B6B;"><strong>Your Price:</strong> ${((session.metadata?.final_price || session.original_price) * 0.85).toFixed(2)} USD</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://gfmhhnynyxvmekhvytgg.supabase.co/courses/${session.course_slug}" 
                       style="background: #FF6B6B; color: white; padding: 18px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      Complete Enrollment Now →
                    </a>
                  </div>
                  <div style="background: #F0F0F0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 0; text-align: center;"><strong>🔥 Join 1,000+ students who've already enrolled</strong></p>
                  </div>
                  <p>After tonight, this offer disappears forever. Don't look back with regret.</p>
                  <p><strong>Questions? We're here to help!</strong><br>
                  Reply to this email or contact us at support@titans-academy.com</p>
                  <p>This is your moment. Seize it!</p>
                  <p>Best regards,<br>The Titans Academy Team</p>
                </div>
              </div>
            `,
          };
        }

        if (emailToSend) {
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
              to: [{ email: session.email, name: session.name || "" }],
              subject: emailToSend.subject,
              htmlContent: emailToSend.content,
              tags: ["checkout-abandonment", emailToSend.type],
            }),
          });

          if (!brevoResponse.ok) {
            const errorText = await brevoResponse.text();
            throw new Error(`Brevo API error: ${errorText}`);
          }

          const brevoData = await brevoResponse.json();
          console.log(`Abandonment email ${emailToSend.sequence} sent to ${session.email}`);

          // Track the email send
          await supabase.from("checkout_abandonment_emails").insert({
            checkout_session_id: session.id,
            email_sequence_number: emailToSend.sequence,
            email_type: emailToSend.type,
            discount_code: discountCode,
          });

          // Update results
          results.processed++;
          if (emailToSend.sequence === 1) results.email1_sent++;
          if (emailToSend.sequence === 2) results.email2_sent++;
          if (emailToSend.sequence === 3) results.email3_sent++;

          // Mark as abandoned after first email
          if (emailToSend.sequence === 1) {
            await supabase
              .from("checkout_sessions")
              .update({ abandoned: true })
              .eq("id", session.id);
          }
        }
      } catch (error) {
        const errorMsg = `Error processing session ${session.id}: ${error instanceof Error ? error.message : "Unknown error"}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    console.log("Abandoned checkout processing complete:", results);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Abandoned checkout processor error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
