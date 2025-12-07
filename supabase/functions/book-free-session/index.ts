import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingRequest {
    fullName: string;
    email: string;
    whatsappNumber: string;
    courseSlug: string;
    courseTitle: string;
}

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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
            fullName,
            email,
            whatsappNumber,
            courseSlug,
            courseTitle,
        }: BookingRequest = await req.json();

        // Validate required fields
        if (!fullName || !email || !whatsappNumber || !courseSlug || !courseTitle) {
            return new Response(
                JSON.stringify({
                    error: "Missing required fields. Please provide fullName, email, whatsappNumber, courseSlug, and courseTitle."
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(
                JSON.stringify({ error: "Invalid email format." }),
                {
                    status: 400,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                }
            );
        }

        console.log(`Processing free session booking for ${courseTitle} from ${email}`);

        // Rate limiting check - max 5 bookings per email per hour
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

        if (rateLimitData && rateLimitData.inquiry_count >= 5) {
            console.log(`Rate limit exceeded for ${email}`);
            return new Response(
                JSON.stringify({
                    error: "Too many booking requests. Please try again later.",
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

        // Get course information from the courses table
        const { data: courseData, error: courseError } = await supabase
            .from("courses")
            .select("id")
            .eq("data->slug", courseSlug)
            .maybeSingle();

        if (courseError) {
            console.error("Error fetching course:", courseError);
        }

        // Insert booking into database
        const { data: bookingData, error: bookingError } = await supabase
            .from("free_session_bookings")
            .insert({
                full_name: fullName,
                email: email,
                whatsapp_number: whatsappNumber,
                course_id: courseData?.id || null,
                course_slug: courseSlug,
                course_title: courseTitle,
                status: 'pending'
            })
            .select()
            .single();

        if (bookingError) {
            console.error("Error creating booking:", bookingError);
            return new Response(
                JSON.stringify({ error: "Failed to create booking. Please try again." }),
                {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                }
            );
        }

        console.log("Booking created successfully:", bookingData.id);

        // Send confirmation email to user
        if (RESEND_API_KEY) {
            const userEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .highlight { background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0; }
            ul { padding-left: 20px; }
            li { margin: 10px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🎓 Free Session Booked!</h1>
            </div>
            <div class="content">
              <h2>Thank you for your interest in ${courseTitle}!</h2>
              <p>Hi ${fullName},</p>
              <p>We've received your request to book a free consultation session. We're excited to help you explore this career opportunity!</p>
              
              <div class="highlight">
                <p style="margin: 0;"><strong>📋 Booking Details:</strong></p>
                <ul style="margin: 10px 0;">
                  <li><strong>Course:</strong> ${courseTitle}</li>
                  <li><strong>Your Email:</strong> ${email}</li>
                  <li><strong>WhatsApp:</strong> ${whatsappNumber}</li>
                </ul>
              </div>

              <p><strong>What happens next?</strong></p>
              <ul>
                <li>Our team will contact you within 24 hours on WhatsApp (${whatsappNumber})</li>
                <li>We'll schedule a convenient time for your free consultation session</li>
                <li>You'll get personalized advice about the course, career opportunities, and learning path</li>
                <li>We'll answer all your questions about enrollment, certification, and job prospects</li>
              </ul>

              <p>If you have any urgent questions, feel free to reach out to us directly at <a href="mailto:support@titanscareers.com">support@titanscareers.com</a>.</p>

              <div class="footer">
                <p>Best regards,<br/>
                <strong>The Titans Careers Team</strong></p>
                <p style="font-size: 12px; color: #9ca3af;">This is an automated confirmation email. Please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

            const userEmailResponse = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: "Titans Careers <onboarding@resend.dev>",
                    to: [email],
                    subject: `Free Session Booked: ${courseTitle}`,
                    html: userEmailHtml,
                }),
            });

            const userEmailText = await userEmailResponse.text();
            console.log(
                "User confirmation email response:",
                userEmailResponse.status,
                userEmailText
            );

            if (!userEmailResponse.ok) {
                console.error(
                    "User confirmation email failed:",
                    userEmailResponse.status,
                    userEmailText
                );
            }

            // Send notification to admin
            const adminEmailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; }
            .actions { margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px; font-weight: bold; }
            .btn-primary { background: #2563eb; color: white; }
            .btn-success { background: #25D366; color: white; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🔔 New Free Session Booking</h2>
            </div>
            <div class="content">
              <div class="info-box">
                <p><strong>📚 Course:</strong> ${courseTitle}</p>
                <p><strong>🔗 Course Slug:</strong> ${courseSlug}</p>
              </div>

              <div class="info-box">
                <p><strong>👤 Name:</strong> ${fullName}</p>
                <p><strong>📧 Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>📱 WhatsApp:</strong> ${whatsappNumber}</p>
              </div>

              <div class="info-box">
                <p><strong>🆔 Booking ID:</strong> ${bookingData.id}</p>
                <p><strong>📅 Submitted:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>📊 Status:</strong> Pending</p>
              </div>

              <div class="actions">
                <a href="https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(fullName)},%20thank%20you%20for%20booking%20a%20free%20session%20for%20${encodeURIComponent(courseTitle)}.%20When%20would%20be%20a%20good%20time%20for%20your%20consultation?" class="button btn-success">Contact on WhatsApp</a>
              </div>

              <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                <em>Please follow up with this lead within 24 hours for best conversion rates.</em>
              </p>
            </div>
          </div>
        </body>
        </html>
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
                    subject: `🎯 New Free Session Booking - ${courseTitle}`,
                    html: adminEmailHtml,
                }),
            });

            const adminEmailText = await adminEmailResponse.text();
            console.log(
                "Admin notification email response:",
                adminEmailResponse.status,
                adminEmailText
            );

            if (!adminEmailResponse.ok) {
                console.error(
                    "Admin notification email failed:",
                    adminEmailResponse.status,
                    adminEmailText
                );
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                bookingId: bookingData.id,
                message: "Your free session has been booked successfully! We'll contact you within 24 hours."
            }),
            {
                status: 200,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("Error processing booking:", error);
        return new Response(
            JSON.stringify({ error: String(error) }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    }
});
