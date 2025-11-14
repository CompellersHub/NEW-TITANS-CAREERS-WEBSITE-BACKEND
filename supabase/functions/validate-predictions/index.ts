import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting prediction validation...');

    // Get all unvalidated predictions that are old enough to validate (24+ hours old)
    const validationCutoff = new Date();
    validationCutoff.setHours(validationCutoff.getHours() - 24);

    const { data: predictions, error: predError } = await supabase
      .from('alert_predictions')
      .select('*')
      .is('validated_at', null)
      .lt('prediction_date', validationCutoff.toISOString())
      .eq('prediction_period', 'next_24h');

    if (predError) {
      console.error('Error fetching predictions:', predError);
      throw predError;
    }

    if (!predictions || predictions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No predictions to validate',
          validated: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${predictions.length} predictions to validate`);

    let validatedCount = 0;
    let totalAccuracy = 0;

    for (const prediction of predictions) {
      try {
        // Check if an alert was actually triggered for this channel in the 24h after prediction
        const predictionTime = new Date(prediction.prediction_date);
        const checkStart = predictionTime;
        const checkEnd = new Date(predictionTime);
        checkEnd.setHours(checkEnd.getHours() + 24);

        const { data: actualAlerts, error: alertError } = await supabase
          .from('recovery_alert_history')
          .select('*')
          .eq('channel', prediction.channel)
          .gte('sent_at', checkStart.toISOString())
          .lte('sent_at', checkEnd.toISOString());

        if (alertError) {
          console.error('Error checking alerts:', alertError);
          continue;
        }

        const wasAlertTriggered = actualAlerts && actualAlerts.length > 0;
        const predictedAlertProbability = prediction.predicted_alert_probability;

        // Calculate accuracy based on threshold
        // If probability >= 50%, we predicted an alert would happen
        const predictedAlert = predictedAlertProbability >= 50;
        const correctPrediction = predictedAlert === wasAlertTriggered;

        // Calculate prediction accuracy percentage
        // For continuous probability, use a scoring system
        let accuracy: number;
        
        if (wasAlertTriggered) {
          // Alert happened: accuracy = how confident we were
          accuracy = predictedAlertProbability;
        } else {
          // No alert: accuracy = how confident we were it wouldn't happen
          accuracy = 100 - predictedAlertProbability;
        }

        // Update prediction with validation results
        const { error: updateError } = await supabase
          .from('alert_predictions')
          .update({
            actual_alert_triggered: wasAlertTriggered,
            prediction_accuracy: accuracy,
            validated_at: new Date().toISOString()
          })
          .eq('id', prediction.id);

        if (updateError) {
          console.error('Error updating prediction:', updateError);
          continue;
        }

        validatedCount++;
        totalAccuracy += accuracy;

        console.log(
          `Validated prediction ${prediction.id}: ` +
          `Predicted ${predictedAlertProbability}%, ` +
          `Actual: ${wasAlertTriggered ? 'Alert' : 'No Alert'}, ` +
          `Accuracy: ${accuracy.toFixed(1)}%`
        );

      } catch (error) {
        console.error(`Error validating prediction ${prediction.id}:`, error);
        continue;
      }
    }

    const avgAccuracy = validatedCount > 0 ? totalAccuracy / validatedCount : 0;

    return new Response(
      JSON.stringify({
        success: true,
        validated: validatedCount,
        average_accuracy: avgAccuracy.toFixed(2),
        total_checked: predictions.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in validate-predictions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});