import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";

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
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find conversations that:
    // 1. Have an email associated
    // 2. Haven't been sent an auto-summary yet
    // 3. Last message was more than 24 hours ago
    // 4. Have at least 3 messages (meaningful conversation)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: inactiveConversations, error: fetchError } = await supabase
      .from("ai_advisor_conversations")
      .select("id, email, title, message_count")
      .not("email", "is", null)
      .eq("auto_summary_sent", false)
      .lt("last_message_at", twentyFourHoursAgo)
      .gte("message_count", 3)
      .limit(50); // Process up to 50 conversations per run

    if (fetchError) {
      console.error("Error fetching inactive conversations:", fetchError);
      throw fetchError;
    }

    if (!inactiveConversations || inactiveConversations.length === 0) {
      console.log("No inactive conversations found");
      return new Response(
        JSON.stringify({ message: "No inactive conversations to process" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Found ${inactiveConversations.length} inactive conversations to process`);

    const results = [];

    // Process each conversation
    for (const conversation of inactiveConversations) {
      try {
        // Call the send-conversation-summary function
        const { data: summaryData, error: summaryError } = await supabase.functions.invoke(
          "send-conversation-summary",
          {
            body: {
              conversationId: conversation.id,
              email: conversation.email,
            },
          }
        );

        if (summaryError) {
          console.error(`Error sending summary for conversation ${conversation.id}:`, summaryError);
          results.push({
            conversationId: conversation.id,
            email: conversation.email,
            success: false,
            error: summaryError.message,
          });
          continue;
        }

        // Mark conversation as summary sent
        const { error: updateError } = await supabase
          .from("ai_advisor_conversations")
          .update({
            auto_summary_sent: true,
            auto_summary_sent_at: new Date().toISOString(),
          })
          .eq("id", conversation.id);

        if (updateError) {
          console.error(`Error updating conversation ${conversation.id}:`, updateError);
        }

        console.log(`Successfully sent summary for conversation ${conversation.id} to ${conversation.email}`);
        results.push({
          conversationId: conversation.id,
          email: conversation.email,
          success: true,
          coursesDiscussed: summaryData?.coursesDiscussed || [],
        });

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Unexpected error processing conversation ${conversation.id}:`, error);
        results.push({
          conversationId: conversation.id,
          email: conversation.email,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Processed ${results.length} conversations: ${successCount} successful, ${failureCount} failed`);

    return new Response(
      JSON.stringify({
        message: `Processed ${results.length} conversations`,
        successCount,
        failureCount,
        results,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in auto-send-summaries:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
