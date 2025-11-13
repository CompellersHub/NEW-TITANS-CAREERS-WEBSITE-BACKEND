import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  email?: string;
  captureIntent?: boolean;
}

// Course information to provide context to the AI
const COURSES_CONTEXT = `
You are an AI career advisor for Titans Careers, a professional training company. Here are our available courses:

1. **AML/KYC Compliance** (£1,497)
   - Category: Compliance & Finance
   - Duration: 12 weeks
   - Best for: Career switchers into finance compliance
   - Salary potential: £35,000-£55,000
   - Key topics: Anti-Money Laundering, Know Your Customer procedures, regulatory frameworks

2. **Crypto & Digital Assets** (£1,497)
   - Category: Compliance & Finance
   - Duration: 10 weeks
   - Best for: Finance professionals wanting crypto expertise
   - Salary potential: £45,000-£75,000
   - Key topics: Blockchain compliance, crypto regulations, digital asset management

3. **Data Privacy & GDPR** (£1,297)
   - Category: Compliance & Privacy
   - Duration: 8 weeks
   - Best for: Legal/compliance professionals, career switchers
   - Salary potential: £40,000-£60,000
   - Key topics: GDPR, data protection laws, privacy frameworks

4. **Data Analysis** (£1,397)
   - Category: Data & Analytics
   - Duration: 16 weeks
   - Best for: Complete beginners, career switchers
   - Salary potential: £35,000-£55,000
   - Key topics: SQL, Python, data visualization, statistical analysis

5. **Cybersecurity** (£1,597)
   - Category: Security & Technology
   - Duration: 20 weeks
   - Best for: Tech enthusiasts, career switchers
   - Salary potential: £45,000-£70,000
   - Key topics: Network security, ethical hacking, security frameworks

6. **Business Analysis** (£1,397)
   - Category: Business & Strategy
   - Duration: 14 weeks
   - Best for: Business professionals wanting to upskill
   - Salary potential: £40,000-£60,000
   - Key topics: Requirements gathering, process modeling, stakeholder management

7. **Digital Marketing** (£1,297)
   - Category: Marketing & Growth
   - Duration: 12 weeks
   - Best for: Marketing professionals, entrepreneurs
   - Salary potential: £30,000-£50,000
   - Key topics: SEO, social media marketing, analytics, content strategy

**Your Role:**
- Help users discover which course suits their goals, experience, and interests
- Ask clarifying questions about their background, goals, and preferences
- Make personalized recommendations based on the conversation
- Be encouraging and supportive about career transitions
- When appropriate (after discussing their needs), gently suggest they provide their email to receive:
  * Personalized course recommendations
  * Free career resources
  * Course guides and materials
- Keep responses conversational, friendly, and concise (2-3 paragraphs max)
- Use bullet points for course recommendations
- Mention salary potential when discussing courses

**Lead Capture Strategy:**
- After 2-3 exchanges where the user shows genuine interest, suggest: "I can send you a personalized course guide based on our conversation. What's your email?"
- If they ask about specific courses multiple times, offer to send detailed information
- When recommending courses, mention you can send full curriculum details via email
- Be natural - don't force the email ask if the conversation is just starting

**Conversation Style:**
- Warm and professional
- Ask one question at a time
- Use emojis sparingly (only for encouragement)
- Show enthusiasm for their career goals
- Be specific about course benefits
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { messages, email, captureIntent }: ChatRequest = await req.json();

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare messages with system context
    const aiMessages = [
      { role: "system", content: COURSES_CONTEXT },
      ...messages,
    ];

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Track the conversation
    const userMessage = messages[messages.length - 1].content;
    
    if (email) {
      // Track AI conversation behavior
      await supabase.from("user_behaviors").insert({
        email,
        behavior_type: "ai_advisor_conversation",
        score_value: 15,
        behavior_data: {
          user_message: userMessage,
          ai_response: aiResponse,
          message_count: messages.length,
        },
      });

      // Update lead score
      await supabase.rpc("update_lead_score", {
        p_email: email,
        p_score_change: 15,
        p_behavior: "ai_advisor_conversation",
      });

      // If capture intent is true, track as high-value interaction
      if (captureIntent) {
        await supabase.from("user_behaviors").insert({
          email,
          behavior_type: "ai_advisor_email_captured",
          score_value: 35,
          behavior_data: {
            captured_via: "ai_advisor",
            conversation_length: messages.length,
          },
        });

        await supabase.rpc("update_lead_score", {
          p_email: email,
          p_score_change: 35,
          p_behavior: "ai_advisor_email_captured",
        });
      }
    } else {
      // Track anonymous conversation
      await supabase.from("user_behaviors").insert({
        email: "anonymous",
        behavior_type: "ai_advisor_anonymous",
        score_value: 0,
        behavior_data: {
          message_count: messages.length,
          user_query: userMessage,
        },
      });
    }

    // Analyze if we should suggest email capture
    const shouldSuggestEmailCapture = 
      !email && 
      messages.length >= 3 && 
      (userMessage.toLowerCase().includes("recommend") || 
       userMessage.toLowerCase().includes("which course") ||
       userMessage.toLowerCase().includes("help me decide"));

    return new Response(
      JSON.stringify({
        response: aiResponse,
        suggestEmailCapture: shouldSuggestEmailCapture,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI course advisor error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
