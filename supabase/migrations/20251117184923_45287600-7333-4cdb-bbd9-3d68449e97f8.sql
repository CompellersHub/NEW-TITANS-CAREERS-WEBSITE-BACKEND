-- Recreate views without SECURITY DEFINER to fix security warnings
-- Drop existing views first
DROP VIEW IF EXISTS public.subscriber_engagement_patterns CASCADE;
DROP VIEW IF EXISTS public.form_analytics_summary CASCADE;
DROP VIEW IF EXISTS public.template_performance CASCADE;
DROP VIEW IF EXISTS public.submission_metrics_by_priority CASCADE;
DROP VIEW IF EXISTS public.assignee_workload CASCADE;
DROP VIEW IF EXISTS public.daily_submission_trends CASCADE;
DROP VIEW IF EXISTS public.form_field_analytics CASCADE;
DROP VIEW IF EXISTS public.submission_sla_overview CASCADE;
DROP VIEW IF EXISTS public.email_template_performance CASCADE;

-- Recreate subscriber_engagement_patterns view
CREATE VIEW public.subscriber_engagement_patterns 
WITH (security_invoker=on) AS
SELECT 
  ns.id AS subscriber_id,
  ns.email,
  ns.engagement_score,
  COUNT(es.id) AS total_emails_received,
  COUNT(es.opened_at) AS total_opens,
  COUNT(es.clicked_at) AS total_clicks,
  ROUND(AVG(EXTRACT(hour FROM es.opened_at)), 0) AS avg_open_hour,
  ROUND(AVG(EXTRACT(dow FROM es.opened_at)), 0) AS avg_open_day,
  MAX(es.opened_at) AS last_open_at
FROM newsletter_subscribers ns
LEFT JOIN email_sends es ON es.email = ns.email
WHERE ns.active = true
GROUP BY ns.id, ns.email, ns.engagement_score;

-- Recreate form_analytics_summary view
CREATE VIEW public.form_analytics_summary
WITH (security_invoker=on) AS
SELECT 
  form_name,
  step_number,
  step_title,
  field_name,
  COUNT(*) AS total_events,
  COUNT(DISTINCT session_id) AS unique_sessions,
  AVG(time_spent_ms) AS avg_time_spent_ms,
  COUNT(CASE WHEN event_type = 'field_error' THEN 1 END) AS error_count,
  COUNT(CASE WHEN event_type = 'step_abandon' THEN 1 END) AS abandon_count,
  COUNT(CASE WHEN event_type = 'step_complete' THEN 1 END) AS complete_count
FROM form_analytics
GROUP BY form_name, step_number, step_title, field_name;

-- Recreate template_performance view
CREATE VIEW public.template_performance
WITH (security_invoker=on) AS
SELECT 
  t.id AS template_id,
  t.name AS template_name,
  t.campaign_type,
  t.is_ab_test,
  t.ab_test_name,
  t.variant_letter,
  t.tags,
  COUNT(DISTINCT es.id) AS sends_count,
  COUNT(DISTINCT CASE WHEN es.opened_at IS NOT NULL THEN es.id END) AS opens_count,
  COUNT(DISTINCT CASE WHEN es.clicked_at IS NOT NULL THEN es.id END) AS clicks_count,
  CASE 
    WHEN COUNT(DISTINCT es.id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN es.opened_at IS NOT NULL THEN es.id END)::numeric / 
                COUNT(DISTINCT es.id)::numeric) * 100, 2)
    ELSE 0
  END AS open_rate,
  CASE 
    WHEN COUNT(DISTINCT es.id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN es.clicked_at IS NOT NULL THEN es.id END)::numeric / 
                COUNT(DISTINCT es.id)::numeric) * 100, 2)
    ELSE 0
  END AS click_rate
FROM email_templates t
LEFT JOIN email_sends es ON es.template_id = t.id
WHERE t.campaign_type = 'nurture'
GROUP BY t.id, t.name, t.campaign_type, t.is_ab_test, t.ab_test_name, t.variant_letter, t.tags;

-- Recreate submission_metrics_by_priority view
CREATE VIEW public.submission_metrics_by_priority
WITH (security_invoker=on) AS
SELECT 
  priority,
  COUNT(*) AS total_submissions,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) AS resolved_count,
  COUNT(CASE WHEN status = 'archived' THEN 1 END) AS archived_count,
  COUNT(CASE WHEN sla_status = 'overdue' THEN 1 END) AS overdue_count,
  COUNT(CASE WHEN sla_status = 'met' OR status IN ('resolved', 'archived') THEN 1 END) AS sla_met_count,
  ROUND(AVG(EXTRACT(epoch FROM 
    CASE 
      WHEN status IN ('resolved', 'archived') AND last_updated_at IS NOT NULL 
      THEN last_updated_at - created_at 
    END) / 3600), 2) AS avg_resolution_hours
FROM form_submissions
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY priority;

-- Recreate assignee_workload view
CREATE VIEW public.assignee_workload
WITH (security_invoker=on) AS
SELECT 
  fs.assigned_to,
  anp.email AS assignee_email,
  COUNT(*) AS total_assigned,
  COUNT(CASE WHEN fs.status = 'resolved' THEN 1 END) AS resolved_count,
  COUNT(CASE WHEN fs.sla_status = 'overdue' THEN 1 END) AS overdue_count,
  COUNT(CASE WHEN fs.status IN ('new', 'in_progress') THEN 1 END) AS active_count,
  ROUND(AVG(EXTRACT(epoch FROM 
    CASE 
      WHEN fs.status = 'resolved' AND fs.last_updated_at IS NOT NULL 
      THEN fs.last_updated_at - fs.created_at 
    END) / 3600), 2) AS avg_resolution_hours
FROM form_submissions fs
LEFT JOIN admin_notification_preferences anp ON anp.admin_user_id = fs.assigned_to
WHERE fs.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY fs.assigned_to, anp.email;

-- Recreate daily_submission_trends view
CREATE VIEW public.daily_submission_trends
WITH (security_invoker=on) AS
SELECT 
  DATE(created_at) AS submission_date,
  COUNT(*) AS total_submissions,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) AS resolved_count,
  COUNT(CASE WHEN sla_status = 'overdue' THEN 1 END) AS overdue_count,
  COUNT(CASE WHEN priority = 'high' THEN 1 END) AS high_priority_count,
  COUNT(CASE WHEN priority = 'medium' THEN 1 END) AS medium_priority_count,
  COUNT(CASE WHEN priority = 'low' THEN 1 END) AS low_priority_count
FROM form_submissions
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;