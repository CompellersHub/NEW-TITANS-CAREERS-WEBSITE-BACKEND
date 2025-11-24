import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InquiryRequest {
  courseSlug: string;
  courseTitle: string;
  inquiryType: "free_session" | "whatsapp_group";
  name: string;
  email: string;
  phone?: string; // For backward compatibility
  whatsapp?: string; // New unified field
  countryCode?: string; // For backward compatibility
  joinWhatsappGroup?: boolean; // Optional flag to join WhatsApp group
  whatsappGroupLink?: string; // Optional link to WhatsApp group
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// WhatsApp group links mapping
const whatsappLinks: Record<string, string> = {
  'aml-kyc': 'https://chat.whatsapp.com/BJnvGHfLUsxKsfAzKUrpxt',
  'data-analysis': 'https://chat.whatsapp.com/LbqHFDSOHT93o2cK1B4bBy',
  'cybersecurity': 'https://chat.whatsapp.com/GiQWDogIW5p29EIdNEg7Qp',
  'crypto-compliance': 'https://chat.whatsapp.com/IlypZPkdoeO01KppJuhP1C',
  'digital-marketing': 'https://chat.whatsapp.com/HyGI51eHI0928YOHvIm1r0',
  'data-privacy': 'https://chat.whatsapp.com/KR1MPvX230j4QjJrGVCbh5',
  'business-analysis': 'https://chat.whatsapp.com/JWOqfCODLD7JgO8RxtY1UH',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      courseSlug,
      courseTitle,
      inquiryType,
      name,
      email,
      phone,
      whatsapp,
      countryCode,
      joinWhatsappGroup,
      whatsappGroupLink,
    }: InquiryRequest = await req.json();

    // Use whatsapp field if provided, otherwise fall back to phone + countryCode
    const phoneNumber = whatsapp || (countryCode && phone ? `${countryCode} ${phone}` : phone || "");

    console.log(`Processing ${inquiryType} inquiry for ${courseTitle} from ${email}`);

    // Rate limiting check - max 3 inquiries per email per hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from("inquiry_rate_limits")
      .select("*")
      .eq("identifier", email)
      .gte("first_attempt_at", oneHourAgo)
      .maybeSingle();

    if (rateLimitError) {
      console.error("Rate limit check error:", rateLimitError);
    }

    if (rateLimitData && rateLimitData.inquiry_count >= 10) {
      console.log(`Rate limit exceeded for ${email}`);
      return new Response(
        JSON.stringify({ 
          error: "Too many requests. Please try again later.",
          rateLimited: true 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Update or insert rate limit record
    if (rateLimitData) {
      await supabase
        .from("inquiry_rate_limits")
        .update({ 
          inquiry_count: rateLimitData.inquiry_count + 1,
          last_attempt_at: new Date().toISOString()
        })
        .eq("id", rateLimitData.id);
    } else {
      await supabase
        .from("inquiry_rate_limits")
        .insert({ 
          identifier: email,
          inquiry_count: 1 
        });
    }

    // Get WhatsApp link from mapping
    const whatsappLink = whatsappLinks[courseSlug];

    // Send confirmation email to user
    if (RESEND_API_KEY) {
      const userEmailHtml = inquiryType === "free_session"
        ? `
          <h2>Thank you for your interest in ${courseTitle}!</h2>
          <p>Hi ${name},</p>
          <p>We've received your request to book a free consultation session.</p>
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Our team will contact you within 24 hours on WhatsApp (${phoneNumber})</li>
            <li>We'll schedule a convenient time for your free session</li>
            <li>You'll get personalized advice about the course and career opportunities</li>
          </ul>
          ${joinWhatsappGroup && whatsappGroupLink ? `
            <div style="margin: 20px 0; padding: 15px; background-color: #FEF3C7; border-radius: 8px;">
              <p style="margin: 0;"><strong>📱 Join our WhatsApp Community:</strong></p>
              <p style="margin: 10px 0;">Get instant access to course updates, free resources, and connect with fellow learners!</p>
              <a href="${whatsappGroupLink}" style="display: inline-block; padding: 10px 20px; background-color: #25D366; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">Join WhatsApp Group</a>
            </div>
          ` : ''}
          <p>If you have any urgent questions, feel free to reach out to us directly.</p>
          <p>Best regards,<br/>The Titans Academy Team</p>
        `
        : `
          <h2>Welcome to the ${courseTitle} Community!</h2>
          <p>Hi ${name},</p>
          <p>Great to have you interested in joining our WhatsApp group!</p>
          ${whatsappLink 
            ? `<p><strong>Click here to join the group:</strong><br/>
               <a href="${whatsappLink}" style="display: inline-block; background: linear-gradient(135deg, #1a1a1a, #4a4a4a); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 16px 0;">Join WhatsApp Group</a></p>`
            : `<p>Our team will send you the WhatsApp group invite link shortly via WhatsApp to ${phoneNumber}.</p>`
          }
          <p><strong>What to expect in the group:</strong></p>
          <ul>
            <li>Connect with fellow students and alumni</li>
            <li>Get course updates and announcements</li>
            <li>Ask questions and share insights</li>
            <li>Access exclusive resources and tips</li>
          </ul>
          <p>Looking forward to seeing you in the group!</p>
          <p>Best regards,<br/>The Titans Academy Team</p>
        `;

      const userEmailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Titans Careers <onboarding@resend.dev>",
          to: ["marketing@titanscareers.com"],
          subject: inquiryType === "free_session"
            ? `Free Session Request: ${courseTitle}`
            : `Join ${courseTitle} WhatsApp Group`,
          html: userEmailHtml,
        }),
      });

      const userEmailText = await userEmailResponse.text();
      console.log(
        "submit-course-inquiry user email response",
        userEmailResponse.status,
        userEmailText,
      );

      if (!userEmailResponse.ok) {
        console.error(
          "submit-course-inquiry user email failed",
          userEmailResponse.status,
          userEmailText,
        );
      }

      // Send notification to admin
      const adminEmailHtml = `
        <h2>New Course Inquiry</h2>
        <p><strong>Type:</strong> ${inquiryType === "free_session" ? "Free Session Request" : "WhatsApp Group Join Request"}</p>
        <p><strong>Course:</strong> ${courseTitle}</p>
        <hr/>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phoneNumber}</p>
        <hr/>
        <p style="margin: 20px 0;">
          <a href="https://lovable.app" style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-right: 10px;">View in Dashboard</a>
          <a href="https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(name)},%20thank%20you%20for%20your%20interest%20in%20${encodeURIComponent(courseTitle)}" style="display: inline-block; background: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">Contact on WhatsApp</a>
        </p>
        <p><em>Submitted at ${new Date().toLocaleString()}</em></p>
      `;

      const adminEmailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Titans Careers <onboarding@resend.dev>",
          to: ["marketing@titanscareers.com"],
          subject: `New ${inquiryType === "free_session" ? "Free Session" : "WhatsApp Group"} Request - ${courseTitle}`,
          html: adminEmailHtml,
        }),
      });

      const adminEmailText = await adminEmailResponse.text();
      console.log(
        "submit-course-inquiry admin email response",
        adminEmailResponse.status,
        adminEmailText,
      );

      if (!adminEmailResponse.ok) {
        console.error(
          "submit-course-inquiry admin email failed",
          adminEmailResponse.status,
          adminEmailText,
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing inquiry:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
