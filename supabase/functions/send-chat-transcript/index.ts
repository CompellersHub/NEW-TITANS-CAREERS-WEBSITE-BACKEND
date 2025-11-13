import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface EmailRequest {
  email: string;
  messages: Message[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, messages }: EmailRequest = await req.json();
    
    console.log('Sending chat transcript to:', email);

    if (!email || !messages || messages.length === 0) {
      throw new Error('Email and messages are required');
    }

    // Format chat transcript as HTML
    const timestamp = new Date().toLocaleString();
    let chatHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">Chat Transcript</h1>
        <p style="color: #666; font-size: 14px;">Generated on ${timestamp}</p>
        <div style="margin-top: 20px;">
    `;

    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'You' : 'Assistant';
      const bgColor = msg.role === 'user' ? '#F3F4F6' : '#EEF2FF';
      const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
      
      chatHtml += `
        <div style="background-color: ${bgColor}; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid ${msg.role === 'user' ? '#6B7280' : '#4F46E5'};">
          <div style="font-weight: bold; color: #333; margin-bottom: 5px;">
            ${role} ${time ? `<span style="font-weight: normal; color: #666; font-size: 12px;">[${time}]</span>` : ''}
          </div>
          <div style="color: #444; white-space: pre-wrap;">${msg.content}</div>
        </div>
      `;
    });

    chatHtml += `
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; color: #666; font-size: 12px;">
          <p>This transcript was generated from your chat session. If you have any questions, please don't hesitate to reach out.</p>
        </div>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'Chat Support <onboarding@resend.dev>',
      to: [email],
      subject: 'Your Chat Transcript',
      html: chatHtml,
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in send-chat-transcript function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to send email' 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
