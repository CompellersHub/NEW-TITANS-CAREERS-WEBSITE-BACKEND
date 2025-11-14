import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AlertSettings {
  id: string;
  admin_email: string;
  enabled: boolean;
  email_conversion_threshold: number;
  sms_conversion_threshold: number;
  whatsapp_conversion_threshold: number;
  overall_conversion_threshold: number;
  email_roi_threshold: number;
  sms_roi_threshold: number;
  whatsapp_roi_threshold: number;
  overall_roi_threshold: number;
  check_interval_hours: number;
  alert_cooldown_hours: number;
}

interface ChannelMetrics {
  conversion_rate: number;
  roi: number;
  sent_count: number;
  converted_count: number;
  revenue: number;
  cost: number;
}

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Checking recovery alerts...');

    // Get all enabled alert settings
    const { data: settings, error: settingsError } = await supabase
      .from('recovery_alert_settings')
      .select('*')
      .eq('enabled', true);

    if (settingsError) {
      console.error('Error fetching alert settings:', settingsError);
      throw settingsError;
    }

    if (!settings || settings.length === 0) {
      console.log('No enabled alert settings found');
      return new Response(JSON.stringify({ message: 'No enabled alert settings' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Calculate current metrics for the last 24 hours
    const metrics = await calculateMetrics(supabase);
    console.log('Current metrics:', metrics);

    // Check each alert setting
    for (const setting of settings as AlertSettings[]) {
      await checkAndSendAlerts(supabase, setting, metrics);
    }

    return new Response(JSON.stringify({ success: true, message: 'Alerts checked successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in check-recovery-alerts:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

async function calculateMetrics(supabase: any): Promise<{
  email: ChannelMetrics;
  sms: ChannelMetrics;
  whatsapp: ChannelMetrics;
  overall: ChannelMetrics;
}> {
  const cutoffDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Email metrics
  const { data: emailData } = await supabase
    .from('checkout_abandonment_emails')
    .select('*')
    .gte('sent_at', cutoffDate);

  const emailSent = emailData?.length || 0;
  const emailConverted = emailData?.filter((e: any) => e.converted).length || 0;
  const emailConversionRate = emailSent > 0 ? (emailConverted / emailSent) * 100 : 0;

  // SMS metrics
  const { data: smsData } = await supabase
    .from('checkout_abandonment_sms')
    .select('*')
    .gte('sent_at', cutoffDate);

  const smsSent = smsData?.length || 0;
  const smsConverted = smsData?.filter((s: any) => s.converted).length || 0;
  const smsConversionRate = smsSent > 0 ? (smsConverted / smsSent) * 100 : 0;

  // WhatsApp metrics
  const { data: whatsappData } = await supabase
    .from('checkout_abandonment_whatsapp')
    .select('*')
    .gte('sent_at', cutoffDate);

  const whatsappSent = whatsappData?.length || 0;
  const whatsappConverted = whatsappData?.filter((w: any) => w.converted).length || 0;
  const whatsappConversionRate = whatsappSent > 0 ? (whatsappConverted / whatsappSent) * 100 : 0;

  // Get revenue data (assuming $100 average per conversion for demo)
  const avgRevenue = 100;
  const emailRevenue = emailConverted * avgRevenue;
  const smsRevenue = smsConverted * avgRevenue;
  const whatsappRevenue = whatsappConverted * avgRevenue;

  // Calculate costs
  const emailCost = emailSent * 0.001; // $0.001 per email
  const smsCost = smsSent * 0.05; // $0.05 per SMS
  const whatsappCost = whatsappSent * 0.01; // $0.01 per WhatsApp

  // Calculate ROI
  const emailROI = emailCost > 0 ? ((emailRevenue - emailCost) / emailCost) * 100 : 0;
  const smsROI = smsCost > 0 ? ((smsRevenue - smsCost) / smsCost) * 100 : 0;
  const whatsappROI = whatsappCost > 0 ? ((whatsappRevenue - whatsappCost) / whatsappCost) * 100 : 0;

  const totalSent = emailSent + smsSent + whatsappSent;
  const totalConverted = emailConverted + smsConverted + whatsappConverted;
  const totalRevenue = emailRevenue + smsRevenue + whatsappRevenue;
  const totalCost = emailCost + smsCost + whatsappCost;
  const overallConversionRate = totalSent > 0 ? (totalConverted / totalSent) * 100 : 0;
  const overallROI = totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;

  return {
    email: {
      conversion_rate: emailConversionRate,
      roi: emailROI,
      sent_count: emailSent,
      converted_count: emailConverted,
      revenue: emailRevenue,
      cost: emailCost,
    },
    sms: {
      conversion_rate: smsConversionRate,
      roi: smsROI,
      sent_count: smsSent,
      converted_count: smsConverted,
      revenue: smsRevenue,
      cost: smsCost,
    },
    whatsapp: {
      conversion_rate: whatsappConversionRate,
      roi: whatsappROI,
      sent_count: whatsappSent,
      converted_count: whatsappConverted,
      revenue: whatsappRevenue,
      cost: whatsappCost,
    },
    overall: {
      conversion_rate: overallConversionRate,
      roi: overallROI,
      sent_count: totalSent,
      converted_count: totalConverted,
      revenue: totalRevenue,
      cost: totalCost,
    },
  };
}

async function checkAndSendAlerts(
  supabase: any,
  setting: AlertSettings,
  metrics: any
): Promise<void> {
  const alerts: Array<{
    type: 'conversion_drop' | 'negative_roi';
    channel: string;
    metricValue: number;
    thresholdValue: number;
    data: any;
  }> = [];

  // Check conversion rate drops
  const channels = ['email', 'sms', 'whatsapp', 'overall'];
  for (const channel of channels) {
    const thresholdKey = `${channel}_conversion_threshold` as keyof AlertSettings;
    const threshold = setting[thresholdKey] as number;
    const conversionRate = metrics[channel].conversion_rate;

    if (conversionRate < threshold) {
      // Check if alert was sent recently (cooldown period)
      const recentAlert = await checkRecentAlert(
        supabase,
        setting.admin_email,
        'conversion_drop',
        channel,
        setting.alert_cooldown_hours
      );

      if (!recentAlert) {
        alerts.push({
          type: 'conversion_drop',
          channel,
          metricValue: conversionRate,
          thresholdValue: threshold,
          data: metrics[channel],
        });
      }
    }
  }

  // Check negative ROI
  for (const channel of channels) {
    const thresholdKey = `${channel}_roi_threshold` as keyof AlertSettings;
    const threshold = setting[thresholdKey] as number;
    const roi = metrics[channel].roi;

    if (roi < threshold) {
      const recentAlert = await checkRecentAlert(
        supabase,
        setting.admin_email,
        'negative_roi',
        channel,
        setting.alert_cooldown_hours
      );

      if (!recentAlert) {
        alerts.push({
          type: 'negative_roi',
          channel,
          metricValue: roi,
          thresholdValue: threshold,
          data: metrics[channel],
        });
      }
    }
  }

  // Send alerts if any
  if (alerts.length > 0) {
    await sendAlertEmail(setting.admin_email, alerts);

    // Record alerts in history
    for (const alert of alerts) {
      await supabase.from('recovery_alert_history').insert({
        alert_type: alert.type,
        channel: alert.channel,
        metric_value: alert.metricValue,
        threshold_value: alert.thresholdValue,
        admin_email: setting.admin_email,
        alert_data: alert.data,
      });
    }

    console.log(`Sent ${alerts.length} alerts to ${setting.admin_email}`);
  }
}

async function checkRecentAlert(
  supabase: any,
  adminEmail: string,
  alertType: string,
  channel: string,
  cooldownHours: number
): Promise<boolean> {
  const cutoffTime = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('recovery_alert_history')
    .select('id')
    .eq('admin_email', adminEmail)
    .eq('alert_type', alertType)
    .eq('channel', channel)
    .gte('sent_at', cutoffTime)
    .limit(1);

  return data && data.length > 0;
}

async function sendAlertEmail(adminEmail: string, alerts: any[]): Promise<void> {
  const alertsByType = alerts.reduce((acc: any, alert) => {
    if (!acc[alert.type]) acc[alert.type] = [];
    acc[alert.type].push(alert);
    return acc;
  }, {});

  let htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">⚠️ Recovery System Alert</h1>
        <p style="color: #f0f0f0; margin: 10px 0 0 0;">Performance thresholds breached</p>
      </div>
      
      <div style="padding: 30px; background: #f9fafb;">
  `;

  if (alertsByType.conversion_drop) {
    htmlContent += `
      <div style="background: white; border-left: 4px solid #ef4444; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
        <h2 style="color: #dc2626; margin-top: 0;">📉 Low Conversion Rate Alerts</h2>
        ${alertsByType.conversion_drop.map((alert: any) => `
          <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; text-transform: capitalize;">${alert.channel}</h3>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Current Rate:</strong> ${alert.metricValue.toFixed(2)}%
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Threshold:</strong> ${alert.thresholdValue.toFixed(2)}%
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Messages Sent:</strong> ${alert.data.sent_count}
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Conversions:</strong> ${alert.data.converted_count}
            </p>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (alertsByType.negative_roi) {
    htmlContent += `
      <div style="background: white; border-left: 4px solid #f59e0b; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
        <h2 style="color: #d97706; margin-top: 0;">💰 Low/Negative ROI Alerts</h2>
        ${alertsByType.negative_roi.map((alert: any) => `
          <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; margin: 0 0 10px 0; text-transform: capitalize;">${alert.channel}</h3>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Current ROI:</strong> ${alert.metricValue.toFixed(2)}%
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Threshold:</strong> ${alert.thresholdValue.toFixed(2)}%
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Revenue:</strong> $${alert.data.revenue.toFixed(2)}
            </p>
            <p style="margin: 5px 0; color: #6b7280;">
              <strong>Cost:</strong> $${alert.data.cost.toFixed(2)}
            </p>
          </div>
        `).join('')}
      </div>
    `;
  }

  htmlContent += `
        <div style="background: #3b82f6; color: white; padding: 20px; border-radius: 8px; text-align: center;">
          <h3 style="margin: 0 0 10px 0;">Recommended Actions</h3>
          <ul style="text-align: left; padding-left: 20px; margin: 10px 0;">
            <li style="margin: 5px 0;">Review and optimize message content</li>
            <li style="margin: 5px 0;">Check timing and frequency settings</li>
            <li style="margin: 5px 0;">Analyze audience segmentation</li>
            <li style="margin: 5px 0;">Consider adjusting discount strategies</li>
          </ul>
          <a href="${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/admin/recovery-analytics" 
             style="display: inline-block; margin-top: 15px; padding: 12px 24px; background: white; color: #3b82f6; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View Full Analytics
          </a>
        </div>
      </div>
      
      <div style="padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
        <p>This is an automated alert from your Recovery Analytics System</p>
        <p>Configure alert settings in your admin dashboard</p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from: 'Recovery Alerts <alerts@resend.dev>',
      to: [adminEmail],
      subject: `⚠️ Recovery System Alert: ${alerts.length} Threshold${alerts.length > 1 ? 's' : ''} Breached`,
      html: htmlContent,
    });

    console.log(`Alert email sent to ${adminEmail}`);
  } catch (error) {
    console.error('Error sending alert email:', error);
    throw error;
  }
}

serve(handler);
