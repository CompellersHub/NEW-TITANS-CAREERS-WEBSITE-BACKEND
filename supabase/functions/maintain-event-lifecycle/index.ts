import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.81.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaintenanceResult {
  success: boolean;
  steps: {
    updateStatuses: boolean;
    archiveExpired: boolean;
    maintainPipeline: boolean;
    generateWeeklyEvents: boolean;
    cleanupOldEvents: boolean;
  };
  counts: {
    cohortsCreated?: number;
    weeklyEventsCreated?: number;
    eventsArchived?: number;
  };
  errors: string[];
  timestamp: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🚀 Starting automated event lifecycle maintenance...');

    const result: MaintenanceResult = {
      success: true,
      steps: {
        updateStatuses: false,
        archiveExpired: false,
        maintainPipeline: false,
        generateWeeklyEvents: false,
        cleanupOldEvents: false,
      },
      counts: {},
      errors: [],
      timestamp: new Date().toISOString(),
    };

    // Step 1: Update event statuses (upcoming -> ongoing -> completed)
    try {
      console.log('📊 Step 1: Updating event statuses...');
      const { error: statusError } = await supabase.rpc('update_event_status');
      
      if (statusError) {
        console.error('❌ Error updating statuses:', statusError);
        result.errors.push(`Status update failed: ${statusError.message}`);
      } else {
        result.steps.updateStatuses = true;
        console.log('✅ Event statuses updated');
      }
    } catch (error) {
      console.error('❌ Exception in status update:', error);
      result.errors.push(`Status update exception: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Step 2: Archive expired events (24+ hours after completion)
    try {
      console.log('🗄️ Step 2: Archiving expired events...');
      const { error: archiveError } = await supabase.rpc('archive_expired_events');
      
      if (archiveError) {
        console.error('❌ Error archiving events:', archiveError);
        result.errors.push(`Archive failed: ${archiveError.message}`);
      } else {
        result.steps.archiveExpired = true;
        console.log('✅ Expired events archived');
      }
    } catch (error) {
      console.error('❌ Exception in archive:', error);
      result.errors.push(`Archive exception: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Step 3: Maintain cohort pipeline (ensure 2 upcoming cohorts per course)
    try {
      console.log('🎓 Step 3: Maintaining cohort pipeline...');
      const { data: pipelineData, error: pipelineError } = await supabase.rpc('maintain_cohort_pipeline');
      
      if (pipelineError) {
        console.error('❌ Error maintaining pipeline:', pipelineError);
        result.errors.push(`Pipeline maintenance failed: ${pipelineError.message}`);
      } else {
        result.steps.maintainPipeline = true;
        result.counts.cohortsCreated = pipelineData?.cohorts_created || 0;
        console.log(`✅ Cohort pipeline maintained - ${result.counts.cohortsCreated} cohorts created`);
      }
    } catch (error) {
      console.error('❌ Exception in pipeline maintenance:', error);
      result.errors.push(`Pipeline exception: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Step 4: Generate weekly events (Q&A, workshops)
    try {
      console.log('📅 Step 4: Generating weekly events...');
      const { data: weeklyData, error: weeklyError } = await supabase.rpc('generate_weekly_events');
      
      if (weeklyError) {
        console.error('❌ Error generating weekly events:', weeklyError);
        result.errors.push(`Weekly events generation failed: ${weeklyError.message}`);
      } else {
        result.steps.generateWeeklyEvents = true;
        result.counts.weeklyEventsCreated = weeklyData?.events_created || 0;
        console.log(`✅ Weekly events generated - ${result.counts.weeklyEventsCreated} events created`);
      }
    } catch (error) {
      console.error('❌ Exception in weekly events generation:', error);
      result.errors.push(`Weekly events exception: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Step 5: Cleanup old events
    try {
      console.log('🧹 Step 5: Cleaning up old events...');
      const { data: cleanupData, error: cleanupError } = await supabase.rpc('cleanup_old_events');
      
      if (cleanupError) {
        console.error('❌ Error cleaning up old events:', cleanupError);
        result.errors.push(`Cleanup failed: ${cleanupError.message}`);
      } else {
        result.steps.cleanupOldEvents = true;
        result.counts.eventsArchived = cleanupData?.archived_count || 0;
        console.log(`✅ Old events cleaned up - ${result.counts.eventsArchived} events archived`);
      }
    } catch (error) {
      console.error('❌ Exception in cleanup:', error);
      result.errors.push(`Cleanup exception: ${error instanceof Error ? error.message : String(error)}`);
    }

    // Determine overall success
    result.success = result.errors.length === 0;

    // Send admin notification if there were errors
    if (result.errors.length > 0) {
      console.log('📧 Sending error notification to admins...');
      
      const { data: adminUsers } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (adminUsers && adminUsers.length > 0) {
        for (const admin of adminUsers) {
          await supabase.from('admin_notifications').insert({
            admin_user_id: admin.user_id,
            notification_type: 'system_error',
            title: 'Event Lifecycle Maintenance Error',
            message: `Automated event maintenance encountered ${result.errors.length} error(s). Please check logs.`,
            metadata: { 
              errors: result.errors, 
              timestamp: result.timestamp,
              counts: result.counts 
            },
          });
        }
      }
    }

    console.log('✨ Event lifecycle maintenance completed:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error('💥 Fatal error in event lifecycle maintenance:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
