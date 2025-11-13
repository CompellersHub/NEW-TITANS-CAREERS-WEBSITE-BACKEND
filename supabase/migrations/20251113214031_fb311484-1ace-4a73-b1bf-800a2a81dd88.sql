-- Create analytics views for efficient querying

-- View: Submission metrics by priority
CREATE OR REPLACE VIEW submission_metrics_by_priority AS
SELECT 
  priority,
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
  COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived_count,
  COUNT(CASE WHEN sla_status = 'overdue' THEN 1 END) as overdue_count,
  COUNT(CASE WHEN sla_status = 'met' OR status IN ('resolved', 'archived') THEN 1 END) as sla_met_count,
  ROUND(AVG(EXTRACT(EPOCH FROM (
    CASE 
      WHEN status IN ('resolved', 'archived') AND last_updated_at IS NOT NULL 
      THEN last_updated_at - created_at 
      ELSE NULL 
    END
  )) / 3600), 2) as avg_resolution_hours
FROM form_submissions
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY priority;

-- View: Submission metrics by assignee
CREATE OR REPLACE VIEW submission_metrics_by_assignee AS
SELECT 
  fs.assigned_to,
  anp.email as assignee_email,
  COUNT(*) as total_assigned,
  COUNT(CASE WHEN fs.status = 'resolved' THEN 1 END) as resolved_count,
  COUNT(CASE WHEN fs.sla_status = 'overdue' THEN 1 END) as overdue_count,
  COUNT(CASE WHEN fs.sla_status = 'met' OR fs.status IN ('resolved', 'archived') THEN 1 END) as sla_met_count,
  ROUND(AVG(EXTRACT(EPOCH FROM (
    CASE 
      WHEN fs.status IN ('resolved', 'archived') AND fs.last_updated_at IS NOT NULL 
      THEN fs.last_updated_at - fs.created_at 
      ELSE NULL 
    END
  )) / 3600), 2) as avg_resolution_hours,
  ROUND(
    COUNT(CASE WHEN fs.sla_status = 'met' OR fs.status IN ('resolved', 'archived') THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as sla_compliance_rate
FROM form_submissions fs
LEFT JOIN admin_notification_preferences anp ON anp.admin_user_id = fs.assigned_to
WHERE fs.created_at >= CURRENT_DATE - INTERVAL '90 days' AND fs.assigned_to IS NOT NULL
GROUP BY fs.assigned_to, anp.email;

-- View: Tag distribution
CREATE OR REPLACE VIEW tag_distribution AS
SELECT 
  unnest(tags) as tag_name,
  COUNT(*) as usage_count,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
  ROUND(AVG(EXTRACT(EPOCH FROM (
    CASE 
      WHEN status IN ('resolved', 'archived') AND last_updated_at IS NOT NULL 
      THEN last_updated_at - created_at 
      ELSE NULL 
    END
  )) / 3600), 2) as avg_resolution_hours
FROM form_submissions
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
  AND tags IS NOT NULL 
  AND array_length(tags, 1) > 0
GROUP BY tag_name
ORDER BY usage_count DESC;

-- View: Form type distribution
CREATE OR REPLACE VIEW form_type_distribution AS
SELECT 
  form_type,
  COUNT(*) as total_count,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_count,
  COUNT(CASE WHEN status = 'new' THEN 1 END) as new_count,
  COUNT(CASE WHEN sla_status = 'overdue' THEN 1 END) as overdue_count,
  ROUND(
    COUNT(CASE WHEN status = 'resolved' THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as resolution_rate
FROM form_submissions
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY form_type;

-- View: Daily submission trends
CREATE OR REPLACE VIEW daily_submission_trends AS
SELECT 
  DATE(created_at) as submission_date,
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN priority = 'high' THEN 1 END) as high_priority_count,
  COUNT(CASE WHEN priority = 'medium' THEN 1 END) as medium_priority_count,
  COUNT(CASE WHEN priority = 'low' THEN 1 END) as low_priority_count,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
  COUNT(CASE WHEN sla_status = 'overdue' THEN 1 END) as overdue_count
FROM form_submissions
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY submission_date DESC;

-- Grant select permissions to authenticated users with admin role
ALTER VIEW submission_metrics_by_priority OWNER TO postgres;
ALTER VIEW submission_metrics_by_assignee OWNER TO postgres;
ALTER VIEW tag_distribution OWNER TO postgres;
ALTER VIEW form_type_distribution OWNER TO postgres;
ALTER VIEW daily_submission_trends OWNER TO postgres;

-- Create RLS policies for views (they inherit from base table policies)
-- Views will respect the RLS policies of the underlying table