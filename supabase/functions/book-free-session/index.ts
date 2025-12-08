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
            .eq("data->>slug", courseSlug)
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

        // Add contact to Brevo
        const brevoApiKey = Deno.env.get("BREVO_API_KEY");

        if (brevoApiKey) {
            try {
                console.log("Adding contact to Brevo...");

                // Split name into first and last
                const nameParts = fullName.trim().split(' ');
                const firstName = nameParts[0] || '';
                const lastName = nameParts.slice(1).join(' ') || '';

                const brevoResponse = await fetch("https://api.brevo.com/v3/contacts", {
                    method: "POST",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        "api-key": brevoApiKey,
                    },
                    body: JSON.stringify({
                        email: email,
                        attributes: {
                            FIRSTNAME: firstName,
                            LASTNAME: lastName,
                            WHATSAPP: whatsappNumber,
                            COURSE_INTEREST: courseTitle,
                            COURSE_SLUG: courseSlug,
                            BOOKING_DATE: new Date().toISOString().split('T')[0],
                            LEAD_SOURCE: "free_session_booking",
                            BOOKING_ID: bookingData.id
                        },
                        listIds: [24], // Free Session Leads list
                        updateEnabled: true // Update contact if already exists
                    }),
                });

                if (!brevoResponse.ok) {
                    const errorText = await brevoResponse.text();
                    console.error("Brevo contact creation error:", errorText);
                    // Don't fail the booking if Brevo fails - just log the error
                } else {
                    // Brevo returns 201 Created with JSON or 204 No Content with no body
                    if (brevoResponse.status === 204) {
                        console.log("Contact added to Brevo successfully (204 No Content)");
                    } else {
                        const brevoData = await brevoResponse.json();
                        console.log("Contact added to Brevo successfully:", brevoData);
                    }
                }
            } catch (brevoError) {
                console.error("Error adding contact to Brevo:", brevoError);
                // Don't fail the booking if Brevo fails - continue with email sending
            }
        } else {
            console.warn("BREVO_API_KEY not configured - skipping Brevo contact creation");
        }

        

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
