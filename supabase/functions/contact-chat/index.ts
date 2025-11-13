import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationId, userIdentifier } = await req.json();
    
    console.log('Received messages:', JSON.stringify(messages, null, 2));
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const systemPrompt = `You are a helpful customer service assistant for a training and consulting company. 
    
Your role is to help visitors with:
- Information about courses and training programs
- Pricing and payment options
- Scheduling and availability
- General company information
- Contact methods (email: info@example.com, phone: +44 20 1234 5678, WhatsApp available)
- Office location: London, UK
- Operating hours: Monday-Friday, 9:00 AM - 6:00 PM GMT

Be friendly, concise, and professional. If you don't know something specific, politely suggest they use the contact form or reach out directly via the contact methods provided.

When analyzing images, describe what you see and provide relevant assistance based on the image content.`;

    // Format messages for Gemini API with multimodal support
    const formattedMessages = messages.map((msg: any) => {
      // If message has attachments (images), format as multimodal content
      if (msg.attachments && msg.attachments.length > 0) {
        const parts = [];
        
        // Add text content if exists
        if (msg.content && msg.content.trim() && msg.content !== 'Attached image(s)') {
          parts.push({ type: 'text', text: msg.content });
        }
        
        // Add image attachments
        for (const attachment of msg.attachments) {
          parts.push({
            type: 'image_url',
            image_url: {
              url: `data:${attachment.mimeType};base64,${attachment.data}`
            }
          });
        }
        
        return {
          role: msg.role,
          content: parts
        };
      }
      
      // Regular text-only message
      return {
        role: msg.role,
        content: msg.content
      };
    });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...formattedMessages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service temporarily unavailable.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Save messages to database if conversationId and userIdentifier are provided
    if (conversationId && userIdentifier) {
      const userMessage = messages[messages.length - 1];
      
      // Update conversation last_message_at
      await supabase
        .from('chat_conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Save user message
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: userMessage.role,
          content: userMessage.content
        });

      // Save assistant message
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: aiMessage
        });
    }

    return new Response(
      JSON.stringify({ message: aiMessage }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in contact-chat function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
