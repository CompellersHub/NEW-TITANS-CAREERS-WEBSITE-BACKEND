import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HistoricalMetrics {
  date: string;
  channel: string;
  conversion_rate: number;
  roi: number;
  sent: number;
  converted: number;
}

interface Prediction {
  channel: string;
  period: string;
  alert_probability: number;
  predicted_conversion_rate: number;
  predicted_roi: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting predictive analytics...');

    // Fetch historical metrics from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [emailData, smsData, whatsappData, alertHistory] = await Promise.all([
      supabase
        .from('checkout_abandonment_emails')
        .select('*')
        .gte('sent_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('checkout_abandonment_sms')
        .select('*')
        .gte('sent_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('checkout_abandonment_whatsapp')
        .select('*')
        .gte('sent_at', thirtyDaysAgo.toISOString()),
      supabase
        .from('recovery_alert_history')
        .select('*')
        .gte('sent_at', thirtyDaysAgo.toISOString())
    ]);

    // Prepare historical data for ML analysis
    const historicalData = prepareHistoricalData(
      emailData.data || [],
      smsData.data || [],
      whatsappData.data || [],
      alertHistory.data || []
    );

    console.log('Historical data prepared, calling ML prediction service...');

    // Use AI for ML-based predictions
    const predictions = await generatePredictions(historicalData);

    console.log(`Generated ${predictions.length} predictions`);

    // Store predictions in database
    const predictionRecords = predictions.map(pred => ({
      prediction_period: pred.period,
      channel: pred.channel,
      predicted_alert_probability: pred.alert_probability,
      predicted_conversion_rate: pred.predicted_conversion_rate,
      predicted_roi: pred.predicted_roi,
      confidence_score: pred.confidence,
      contributing_factors: pred.factors,
      recommendations: pred.recommendations
    }));

    const { error: insertError } = await supabase
      .from('alert_predictions')
      .insert(predictionRecords);

    if (insertError) {
      console.error('Error storing predictions:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        predictions_generated: predictions.length,
        predictions: predictions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in predict-alerts:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function prepareHistoricalData(
  emailData: any[],
  smsData: any[],
  whatsappData: any[],
  alertHistory: any[]
): any {
  const dailyMetrics = new Map<string, any>();

  // Process email data
  emailData.forEach(record => {
    const date = new Date(record.sent_at).toISOString().split('T')[0];
    if (!dailyMetrics.has(date)) {
      dailyMetrics.set(date, { 
        email: { sent: 0, opened: 0, clicked: 0, converted: 0 },
        sms: { sent: 0, delivered: 0, clicked: 0, converted: 0 },
        whatsapp: { sent: 0, delivered: 0, read: 0, clicked: 0, converted: 0 },
        alerts: []
      });
    }
    const day = dailyMetrics.get(date);
    day.email.sent++;
    if (record.opened) day.email.opened++;
    if (record.clicked) day.email.clicked++;
    if (record.converted) day.email.converted++;
  });

  // Process SMS data
  smsData.forEach(record => {
    const date = new Date(record.sent_at).toISOString().split('T')[0];
    if (!dailyMetrics.has(date)) {
      dailyMetrics.set(date, { 
        email: { sent: 0, opened: 0, clicked: 0, converted: 0 },
        sms: { sent: 0, delivered: 0, clicked: 0, converted: 0 },
        whatsapp: { sent: 0, delivered: 0, read: 0, clicked: 0, converted: 0 },
        alerts: []
      });
    }
    const day = dailyMetrics.get(date);
    day.sms.sent++;
    if (record.delivered) day.sms.delivered++;
    if (record.clicked) day.sms.clicked++;
    if (record.converted) day.sms.converted++;
  });

  // Process WhatsApp data
  whatsappData.forEach(record => {
    const date = new Date(record.sent_at).toISOString().split('T')[0];
    if (!dailyMetrics.has(date)) {
      dailyMetrics.set(date, { 
        email: { sent: 0, opened: 0, clicked: 0, converted: 0 },
        sms: { sent: 0, delivered: 0, clicked: 0, converted: 0 },
        whatsapp: { sent: 0, delivered: 0, read: 0, clicked: 0, converted: 0 },
        alerts: []
      });
    }
    const day = dailyMetrics.get(date);
    day.whatsapp.sent++;
    if (record.delivered) day.whatsapp.delivered++;
    if (record.read) day.whatsapp.read++;
    if (record.clicked) day.whatsapp.clicked++;
    if (record.converted) day.whatsapp.converted++;
  });

  // Process alert history
  alertHistory.forEach(alert => {
    const date = new Date(alert.sent_at).toISOString().split('T')[0];
    if (dailyMetrics.has(date)) {
      const day = dailyMetrics.get(date);
      day.alerts.push({
        type: alert.alert_type,
        channel: alert.channel,
        metric_value: alert.metric_value,
        threshold_value: alert.threshold_value
      });
    }
  });

  return {
    daily_metrics: Array.from(dailyMetrics.entries()).map(([date, metrics]) => ({
      date,
      ...metrics
    })),
    summary: {
      total_days: dailyMetrics.size,
      total_alerts: alertHistory.length,
      email_total: emailData.length,
      sms_total: smsData.length,
      whatsapp_total: whatsappData.length
    }
  };
}

async function generatePredictions(historicalData: any): Promise<Prediction[]> {
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

  // Use Gemini by default for cost-effectiveness
  const useGemini = !!GEMINI_API_KEY;
  const API_KEY = useGemini ? GEMINI_API_KEY : OPENAI_API_KEY;
  
  if (!API_KEY) {
    throw new Error("No AI API key configured");
  }

  const prompt = `You are a predictive analytics expert analyzing abandoned checkout recovery campaign performance.

Historical Data Summary:
- Total days of data: ${historicalData.summary.total_days}
- Total alerts triggered: ${historicalData.summary.total_alerts}
- Email campaigns: ${historicalData.summary.email_total}
- SMS campaigns: ${historicalData.summary.sms_total}
- WhatsApp campaigns: ${historicalData.summary.whatsapp_total}

Daily Metrics (last 7 days sample):
${JSON.stringify(historicalData.daily_metrics.slice(-7), null, 2)}

Based on this historical data, predict:
1. For each channel (email, sms, whatsapp, overall):
   - Probability of alert being triggered in next 24 hours (0-100)
   - Predicted conversion rate
   - Predicted ROI
   - Confidence score (0-100)
   - Key contributing factors (declining trends, seasonality, etc.)
   - Specific recommendations to prevent alerts

2. Identify patterns that historically led to alerts
3. Consider day-of-week effects, trends, and recent performance

Provide predictions for three time periods: next_24h, next_7d, next_30d.

Return ONLY a JSON array of predictions with this exact structure:
[
  {
    "channel": "email",
    "period": "next_24h",
    "alert_probability": 45.5,
    "predicted_conversion_rate": 4.2,
    "predicted_roi": -15.3,
    "confidence": 78.5,
    "factors": ["Declining engagement trend", "Weekend effect"],
    "recommendations": ["Increase discount in emails", "Optimize send times"]
  }
]`;

  let response;
  const systemPrompt = "You are an expert data scientist specializing in predictive analytics for marketing campaigns. Always respond with valid JSON only.";

  if (useGemini) {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        }
      }),
    });
  } else {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      }),
    });
  }

  if (!response.ok) {
    throw new Error(`ML API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const content = useGemini 
    ? data.candidates[0].content.parts[0].text
    : data.choices[0].message.content;
  
  // Extract JSON from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse ML predictions response');
  }

  return JSON.parse(jsonMatch[0]);
}