import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConversationSummaryRequest {
  conversationId: string;
  email: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, email }: ConversationSummaryRequest = await req.json();

    if (!conversationId || !email) {
      throw new Error("Missing required fields: conversationId and email");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch conversation details
    const { data: conversation, error: convError } = await supabase
      .from("ai_advisor_conversations")
      .select("title, created_at, message_count")
      .eq("id", conversationId)
      .single();

    if (convError) throw convError;

    // Fetch messages
    const { data: messages, error: msgError } = await supabase
      .from("ai_advisor_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (msgError) throw msgError;

    // Get active A/B test variants
    const { data: variants, error: variantError } = await supabase
      .from("email_ab_variants")
      .select("*")
      .eq("email_type", "conversation_summary")
      .eq("is_active", true);

    if (variantError) throw variantError;

    // Select random variant for A/B testing
    const selectedVariant = variants && variants.length > 0 
      ? variants[Math.floor(Math.random() * variants.length)]
      : {
          id: null,
          subject_line: "Your AI Career Advisor Conversation Summary",
          preview_text: "Review your personalized course recommendations"
        };

    // Extract course recommendations from messages
    const courseKeywords = ["Power BI", "SQL", "Python", "Tableau", "Excel", "Azure", "AWS", "Data Science"];
    const mentionedCourses = new Set<string>();
    
    messages?.forEach((msg) => {
      courseKeywords.forEach((course) => {
        if (msg.content.toLowerCase().includes(course.toLowerCase())) {
          mentionedCourses.add(course);
        }
      });
    });

    // Generate conversation summary
    const conversationTitle = conversation?.title || "AI Career Advisor Conversation";
    const messageCount = conversation?.message_count || 0;
    const coursesDiscussed = Array.from(mentionedCourses);

    // Create tracking record
    const { data: trackingData, error: trackingError } = await supabase
      .from("email_sends")
      .insert({
        conversation_id: conversationId,
        variant_id: selectedVariant.id,
        email: email,
      })
      .select("tracking_id")
      .single();

    if (trackingError) {
      console.error("Error creating tracking record:", trackingError);
    }

    const trackingId = trackingData?.tracking_id || "";
    const trackingPixelUrl = `${supabaseUrl}/functions/v1/track-email-open?id=${trackingId}`;
    const trackCoursesUrl = `${supabaseUrl}/courses?track=${trackingId}`;

    // Build email HTML with tracking
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .course-card { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #e0e0e0; }
            .course-name { font-weight: bold; color: #667eea; font-size: 16px; margin-bottom: 5px; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .messages { max-height: 400px; overflow-y: auto; margin-top: 20px; }
            .message { margin: 10px 0; padding: 10px; border-radius: 6px; }
            .user-message { background: #e3f2fd; text-align: right; }
            .assistant-message { background: #f5f5f5; }
            .message-label { font-weight: bold; font-size: 12px; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Your AI Career Advisor Summary</h1>
              <p>Thank you for chatting with us!</p>
            </div>
            
            <div class="content">
              <div class="summary">
                <h2>Conversation Overview</h2>
                <p><strong>Topic:</strong> ${conversationTitle}</p>
                <p><strong>Messages Exchanged:</strong> ${messageCount}</p>
                <p><strong>Date:</strong> ${new Date(conversation?.created_at).toLocaleDateString()}</p>
              </div>

              ${coursesDiscussed.length > 0 ? `
                <h2>🎯 Courses Discussed</h2>
                <p>Based on our conversation, here are the courses we talked about:</p>
                ${coursesDiscussed.map(course => `
                  <div class="course-card">
                    <div class="course-name">${course}</div>
                    <p>Enhance your career with our comprehensive ${course} training program.</p>
                  </div>
                `).join('')}
                
                <div style="text-align: center;">
                  <a href="${trackCoursesUrl}" class="cta-button">
                    View All Courses
                  </a>
                </div>
              ` : ''}

              <div class="summary">
                <h2>📝 Conversation Transcript</h2>
                <p style="color: #666; font-size: 14px;">Review your conversation below:</p>
                <div class="messages">
                  ${messages?.map(msg => `
                    <div class="message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}">
                      <div class="message-label">${msg.role === 'user' ? 'You' : 'AI Advisor'}:</div>
                      <div>${msg.content}</div>
                    </div>
                  `).join('') || ''}
                </div>
              </div>

              <div class="summary">
                <h2>💡 Next Steps</h2>
                <ul>
                  <li>Explore our course catalog to find the perfect fit for your career goals</li>
                  <li>Review the courses discussed in this conversation</li>
                  <li>Book a free consultation to discuss your learning path</li>
                  <li>Check out our success stories from past students</li>
                </ul>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <p>Have more questions? Continue the conversation:</p>
                <a href="https://titanscareers.com?track=${trackingId}" class="cta-button">
                  Chat with AI Advisor Again
                </a>
              </div>

              <div class="footer">
                <p>This summary was automatically generated based on your conversation.</p>
                <p>Titans Careers | Building Tomorrow's Tech Leaders</p>
                <p>
                  <a href="https://titanscareers.com?track=${trackingId}" style="color: #667eea;">Visit Our Website</a> | 
                  <a href="https://titanscareers.com/contact?track=${trackingId}" style="color: #667eea;">Contact Us</a>
                </p>
              </div>
            </div>
          </div>
          <!-- Tracking Pixel -->
          <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
        </body>
      </html>
    `;

    // Send email with A/B tested subject line
    const emailResponse = await resend.emails.send({
      from: "Titans Careers <onboarding@resend.dev>",
      to: [email],
      subject: selectedVariant.subject_line,
      html: emailHtml,
    });

    console.log("Conversation summary email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.id,
        coursesDiscussed: coursesDiscussed,
        variant: selectedVariant.variant_name,
        trackingId: trackingId
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
    console.error("Error sending conversation summary:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConversationSummaryRequest {
  conversationId: string;
  email: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conversationId, email }: ConversationSummaryRequest = await req.json();

    if (!conversationId || !email) {
      throw new Error("Missing required fields: conversationId and email");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch conversation details
    const { data: conversation, error: convError } = await supabase
      .from("ai_advisor_conversations")
      .select("title, created_at, message_count")
      .eq("id", conversationId)
      .single();

    if (convError) throw convError;

    // Fetch messages
    const { data: messages, error: msgError } = await supabase
      .from("ai_advisor_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (msgError) throw msgError;

    // Extract course recommendations from messages
    const courseKeywords = ["Power BI", "SQL", "Python", "Tableau", "Excel", "Azure", "AWS", "Data Science"];
    const mentionedCourses = new Set<string>();
    
    messages?.forEach((msg) => {
      courseKeywords.forEach((course) => {
        if (msg.content.toLowerCase().includes(course.toLowerCase())) {
          mentionedCourses.add(course);
        }
      });
    });

    // Generate conversation summary
    const conversationTitle = conversation?.title || "AI Career Advisor Conversation";
    const messageCount = conversation?.message_count || 0;
    const coursesDiscussed = Array.from(mentionedCourses);

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .course-card { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border: 1px solid #e0e0e0; }
            .course-name { font-weight: bold; color: #667eea; font-size: 16px; margin-bottom: 5px; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .messages { max-height: 400px; overflow-y: auto; margin-top: 20px; }
            .message { margin: 10px 0; padding: 10px; border-radius: 6px; }
            .user-message { background: #e3f2fd; text-align: right; }
            .assistant-message { background: #f5f5f5; }
            .message-label { font-weight: bold; font-size: 12px; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✨ Your AI Career Advisor Summary</h1>
              <p>Thank you for chatting with us!</p>
            </div>
            
            <div class="content">
              <div class="summary">
                <h2>Conversation Overview</h2>
                <p><strong>Topic:</strong> ${conversationTitle}</p>
                <p><strong>Messages Exchanged:</strong> ${messageCount}</p>
                <p><strong>Date:</strong> ${new Date(conversation?.created_at).toLocaleDateString()}</p>
              </div>

              ${coursesDiscussed.length > 0 ? `
                <h2>🎯 Courses Discussed</h2>
                <p>Based on our conversation, here are the courses we talked about:</p>
                ${coursesDiscussed.map(course => `
                  <div class="course-card">
                    <div class="course-name">${course}</div>
                    <p>Enhance your career with our comprehensive ${course} training program.</p>
                  </div>
                `).join('')}
                
                <div style="text-align: center;">
                  <a href="https://titanscareers.com/courses" class="cta-button">
                    View All Courses
                  </a>
                </div>
              ` : ''}

              <div class="summary">
                <h2>📝 Conversation Transcript</h2>
                <p style="color: #666; font-size: 14px;">Review your conversation below:</p>
                <div class="messages">
                  ${messages?.map(msg => `
                    <div class="message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}">
                      <div class="message-label">${msg.role === 'user' ? 'You' : 'AI Advisor'}:</div>
                      <div>${msg.content}</div>
                    </div>
                  `).join('') || ''}
                </div>
              </div>

              <div class="summary">
                <h2>💡 Next Steps</h2>
                <ul>
                  <li>Explore our course catalog to find the perfect fit for your career goals</li>
                  <li>Review the courses discussed in this conversation</li>
                  <li>Book a free consultation to discuss your learning path</li>
                  <li>Check out our success stories from past students</li>
                </ul>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <p>Have more questions? Continue the conversation:</p>
                <a href="https://titanscareers.com" class="cta-button">
                  Chat with AI Advisor Again
                </a>
              </div>

              <div class="footer">
                <p>This summary was automatically generated based on your conversation.</p>
                <p>Titans Careers | Building Tomorrow's Tech Leaders</p>
                <p>
                  <a href="https://titanscareers.com" style="color: #667eea;">Visit Our Website</a> | 
                  <a href="https://titanscareers.com/contact" style="color: #667eea;">Contact Us</a>
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Titans Careers <onboarding@resend.dev>",
      to: [email],
      subject: `Your Conversation Summary - ${conversationTitle}`,
      html: emailHtml,
    });

    console.log("Conversation summary email sent:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.id,
        coursesDiscussed: coursesDiscussed 
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
    console.error("Error sending conversation summary:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
