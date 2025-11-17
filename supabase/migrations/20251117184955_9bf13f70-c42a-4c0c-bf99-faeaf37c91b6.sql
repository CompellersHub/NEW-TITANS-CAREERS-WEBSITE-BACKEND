-- Fix remaining security definer views
DROP VIEW IF EXISTS public.form_type_distribution CASCADE;
DROP VIEW IF EXISTS public.submission_metrics_by_assignee CASCADE;
DROP VIEW IF EXISTS public.tag_distribution CASCADE;
DROP VIEW IF EXISTS public.user_order_history CASCADE;

-- Recreate form_type_distribution view
CREATE VIEW public.form_type_distribution
WITH (security_invoker=on) AS
SELECT 
  form_type,
  COUNT(*) AS total_submissions,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) AS resolved_count,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) AS in_progress_count,
  COUNT(CASE WHEN status = 'new' THEN 1 END) AS new_count,
  ROUND(AVG(EXTRACT(epoch FROM 
    CASE 
      WHEN status = 'resolved' AND last_updated_at IS NOT NULL 
      THEN last_updated_at - created_at 
    END) / 3600), 2) AS avg_resolution_hours
FROM form_submissions
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY form_type;

-- Recreate submission_metrics_by_assignee view  
CREATE VIEW public.submission_metrics_by_assignee
WITH (security_invoker=on) AS
SELECT 
  fs.assigned_to,
  COUNT(*) AS total_assigned,
  COUNT(CASE WHEN fs.status = 'resolved' THEN 1 END) AS resolved_count,
  COUNT(CASE WHEN fs.status = 'in_progress' THEN 1 END) AS in_progress_count,
  COUNT(CASE WHEN fs.sla_status = 'overdue' THEN 1 END) AS overdue_count,
  ROUND(AVG(EXTRACT(epoch FROM 
    CASE 
      WHEN fs.status = 'resolved' AND fs.last_updated_at IS NOT NULL 
      THEN fs.last_updated_at - fs.created_at 
    END) / 3600), 2) AS avg_resolution_hours
FROM form_submissions fs
WHERE fs.assigned_to IS NOT NULL
  AND fs.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY fs.assigned_to;

-- Recreate tag_distribution view
CREATE VIEW public.tag_distribution
WITH (security_invoker=on) AS
SELECT 
  unnest(tags) AS tag,
  COUNT(*) AS tag_count,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) AS resolved_count,
  ROUND(AVG(EXTRACT(epoch FROM 
    CASE 
      WHEN status = 'resolved' AND last_updated_at IS NOT NULL 
      THEN last_updated_at - created_at 
    END) / 3600), 2) AS avg_resolution_hours
FROM form_submissions
WHERE tags IS NOT NULL 
  AND array_length(tags, 1) > 0
  AND created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY unnest(tags)
ORDER BY tag_count DESC;

-- Recreate user_order_history view
CREATE VIEW public.user_order_history
WITH (security_invoker=on) AS
SELECT 
  e.customer_email,
  e.course_slug,
  e.course_title,
  e.price,
  e.payment_method,
  e.payment_status,
  e.created_at,
  e.payment_metadata
FROM enrollments e
ORDER BY e.created_at DESC;