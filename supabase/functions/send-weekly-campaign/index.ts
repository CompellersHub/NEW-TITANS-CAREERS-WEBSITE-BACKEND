import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Subscriber {
  email: string;
  name: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting weekly campaign send...");

    // Parse request body for optional segment targeting
    const { segmentId } = await req.json().catch(() => ({ segmentId: null }));
    console.log("Segment targeting:", segmentId || "All subscribers");

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Brevo API key
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    // Determine campaign type rotation (cycle through types each week)
    const campaignTypes = ["career_tips", "job_alerts", "course_updates"];
    const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const campaignType = campaignTypes[weekNumber % campaignTypes.length];

    console.log(`Campaign type for this week: ${campaignType}`);

    // Get next unsent content for this campaign type
    const { data: content, error: contentError } = await supabase
      .from("campaign_content")
      .select("*")
      .eq("campaign_type", campaignType)
      .eq("is_active", true)
      .not("content_key", "in", 
        supabase
          .from("email_campaigns")
          .select("content_key")
      )
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (contentError) {
      console.error("Error fetching content:", contentError);
      throw contentError;
    }

    if (!content) {
      console.log("No unsent content available for this campaign type");
      return new Response(
        JSON.stringify({ 
          message: "No content available",
          campaignType 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Selected content: ${content.subject}`);

    // Fetch active subscribers, optionally filtered by segment
    let subscribersQuery = supabase
      .from("newsletter_subscribers")
      .select("email, name, tags, engagement_score")
      .eq("active", true);

    // If segment is specified, apply segment filters
    if (segmentId) {
      console.log(`Applying segment filters for segment: ${segmentId}`);
      
      // Get segment details
      const { data: segment, error: segmentError } = await supabase
        .from("subscriber_segments")
        .select("*")
        .eq("id", segmentId)
        .single();

      if (segmentError) {
        console.error("Error fetching segment:", segmentError);
        throw segmentError;
      }

      if (!segment) {
        throw new Error("Segment not found");
      }

      console.log(`Segment details:`, {
        name: segment.name,
        tags_include: segment.tags_include,
        tags_exclude: segment.tags_exclude,
        engagement_range: [segment.min_engagement_score, segment.max_engagement_score]
      });

      // Apply engagement score filters
      subscribersQuery = subscribersQuery
        .gte("engagement_score", segment.min_engagement_score)
        .lte("engagement_score", segment.max_engagement_score);
    }

    const { data: allSubscribers, error: subscribersError } = await subscribersQuery;

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
      throw subscribersError;
    }

    if (!allSubscribers || allSubscribers.length === 0) {
      console.log("No subscribers found matching criteria");
      return new Response(
        JSON.stringify({ message: "No subscribers found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Apply tag filters if segment is specified
    let subscribers = allSubscribers;
    
    if (segmentId) {
      const { data: segment } = await supabase
        .from("subscriber_segments")
        .select("tags_include, tags_exclude")
        .eq("id", segmentId)
        .single();

      if (segment) {
        subscribers = allSubscribers.filter((sub: any) => {
          const subTags = sub.tags || [];
          
          // Check include tags (subscriber must have at least one, or include is empty)
          const includeMatch = 
            segment.tags_include.length === 0 || 
            segment.tags_include.some((tag: string) => subTags.includes(tag));
          
          // Check exclude tags (subscriber must not have any)
          const excludeMatch = 
            segment.tags_exclude.length === 0 || 
            !segment.tags_exclude.some((tag: string) => subTags.includes(tag));
          
          return includeMatch && excludeMatch;
        });
      }
    }

    if (subscribers.length === 0) {
      console.log("No subscribers match segment criteria after tag filtering");
      return new Response(
        JSON.stringify({ message: "No subscribers match segment criteria" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${subscribers.length} subscribers matching criteria`);

    // Prepare recipients for Brevo
    const recipients = subscribers.map((sub: Subscriber) => ({
      email: sub.email,
      name: sub.name || sub.email,
    }));

    // Send email via Brevo
    console.log("Sending campaign via Brevo...");
    
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify({
        sender: {
          name: "Titans Careers",
          email: "newsletter@titanscareers.com",
        },
        to: recipients.slice(0, 50), // Brevo free tier limit - adjust as needed
        subject: content.subject,
        htmlContent: content.html_content,
        textContent: content.preview_text || content.subject,
        params: {
          unsubscribe_url: `${supabaseUrl}/unsubscribe`, // You'd implement this
        },
      }),
    });

    const brevoResult = await brevoResponse.json();
    
    if (!brevoResponse.ok) {
      console.error("Brevo API error:", brevoResult);
      throw new Error(`Brevo API error: ${JSON.stringify(brevoResult)}`);
    }

    console.log("Campaign sent successfully via Brevo:", brevoResult);

    // Record campaign in database
    const { error: insertError } = await supabase
      .from("email_campaigns")
      .insert({
        campaign_type: campaignType,
        subject: content.subject,
        content_key: content.content_key,
        recipient_count: recipients.length,
        success_count: recipients.length,
        failure_count: 0,
        segment_id: segmentId || null,
        metadata: {
          brevo_message_id: brevoResult.messageId,
          sent_to: recipients.length > 50 ? 50 : recipients.length,
          segment_targeted: !!segmentId,
        },
      });

    if (insertError) {
      console.error("Error recording campaign:", insertError);
      // Don't fail the whole operation if recording fails
    }

    console.log("Weekly campaign completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Campaign sent successfully",
        campaignType,
        subject: content.subject,
        recipientCount: recipients.length,
        messageId: brevoResult.messageId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-weekly-campaign function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error",
        details: error.toString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
