-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Auto-priority function based on keywords in form data
CREATE OR REPLACE FUNCTION auto_set_priority()
RETURNS TRIGGER AS $$
DECLARE
  form_text text;
  high_keywords text[] := ARRAY['urgent', 'emergency', 'asap', 'critical', 'important', 'immediately', 'help'];
  low_keywords text[] := ARRAY['question', 'inquiry', 'general', 'info', 'information', 'wondering'];
BEGIN
  -- Convert form_data to searchable text
  form_text := lower(NEW.form_data::text);
  
  -- Check for high priority keywords
  IF form_text ~ ANY(high_keywords) THEN
    NEW.priority := 'high';
    RETURN NEW;
  END IF;
  
  -- Check for low priority keywords
  IF form_text ~ ANY(low_keywords) THEN
    NEW.priority := 'low';
    RETURN NEW;
  END IF;
  
  -- Default to medium if no keywords match and no priority set
  IF NEW.priority IS NULL THEN
    NEW.priority := 'medium';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auto-tag function based on keywords in form data
CREATE OR REPLACE FUNCTION auto_tag_submission()
RETURNS TRIGGER AS $$
DECLARE
  form_text text;
  new_tags text[] := '{}';
BEGIN
  -- Convert form_data to searchable text
  form_text := lower(NEW.form_data::text);
  
  -- Auto-tag based on keywords
  IF form_text ~ 'course|training|class|workshop|program' THEN
    new_tags := array_append(new_tags, 'courses');
  END IF;
  
  IF form_text ~ 'price|cost|payment|invoice|billing|refund' THEN
    new_tags := array_append(new_tags, 'billing');
  END IF;
  
  IF form_text ~ 'technical|bug|error|issue|problem|not working' THEN
    new_tags := array_append(new_tags, 'technical');
  END IF;
  
  IF form_text ~ 'schedule|time|date|calendar|when|timing' THEN
    new_tags := array_append(new_tags, 'scheduling');
  END IF;
  
  IF form_text ~ 'cancel|refund|return|money back' THEN
    new_tags := array_append(new_tags, 'refunds');
  END IF;
  
  IF form_text ~ 'contact|email|phone|call|reach' THEN
    new_tags := array_append(new_tags, 'contact-info');
  END IF;
  
  IF form_text ~ 'feedback|suggestion|improve|complaint' THEN
    new_tags := array_append(new_tags, 'feedback');
  END IF;
  
  -- Add form type as tag
  IF NEW.form_type IS NOT NULL THEN
    new_tags := array_append(new_tags, NEW.form_type);
  END IF;
  
  -- Merge with existing tags if any
  IF NEW.tags IS NOT NULL AND array_length(NEW.tags, 1) > 0 THEN
    NEW.tags := array_cat(NEW.tags, new_tags);
  ELSE
    NEW.tags := new_tags;
  END IF;
  
  -- Remove duplicates and empty strings
  NEW.tags := ARRAY(SELECT DISTINCT unnest(NEW.tags) WHERE unnest(NEW.tags) != '');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auto-assign function based on form type (load balancing)
CREATE OR REPLACE FUNCTION auto_assign_submission()
RETURNS TRIGGER AS $$
DECLARE
  admin_id uuid;
BEGIN
  -- Only auto-assign if not already assigned
  IF NEW.assigned_to IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- Find admin with least assigned open submissions (load balancing)
  SELECT ur.user_id INTO admin_id
  FROM user_roles ur
  LEFT JOIN form_submissions fs ON fs.assigned_to = ur.user_id AND fs.status IN ('new', 'in_progress')
  WHERE ur.role = 'admin'
  GROUP BY ur.user_id
  ORDER BY COUNT(fs.id) ASC, random()
  LIMIT 1;
  
  -- Assign to the admin if found
  IF admin_id IS NOT NULL THEN
    NEW.assigned_to := admin_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Notification function for status changes
CREATE OR REPLACE FUNCTION notify_on_status_change()
RETURNS TRIGGER AS $$
DECLARE
  admin_prefs record;
  should_notify boolean;
BEGIN
  -- Only process if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Check if assigned admin wants notifications for this status
    IF NEW.assigned_to IS NOT NULL THEN
      SELECT * INTO admin_prefs
      FROM admin_notification_preferences
      WHERE admin_user_id = NEW.assigned_to;
      
      should_notify := false;
      
      -- Check if admin wants instant alerts
      IF admin_prefs.instant_alerts THEN
        -- Check specific status preferences
        IF NEW.status = 'new' AND admin_prefs.notify_new_status THEN
          should_notify := true;
        ELSIF NEW.status = 'in_progress' AND admin_prefs.notify_in_progress_status THEN
          should_notify := true;
        ELSIF NEW.status = 'resolved' AND admin_prefs.notify_resolved_status THEN
          should_notify := true;
        ELSIF NEW.status = 'archived' AND admin_prefs.notify_archived_status THEN
          should_notify := true;
        END IF;
        
        -- Send notification via edge function
        IF should_notify THEN
          PERFORM net.http_post(
            url := 'https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/send-admin-notification',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4'
            ),
            body := jsonb_build_object(
              'type', 'status_change',
              'submission_id', NEW.id,
              'old_status', OLD.status,
              'new_status', NEW.status,
              'form_type', NEW.form_type,
              'assigned_to', NEW.assigned_to,
              'priority', NEW.priority
            )
          );
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automated workflows
-- Priority must be set first, then tags, then assignment

DROP TRIGGER IF EXISTS trigger_auto_set_priority ON form_submissions;
CREATE TRIGGER trigger_auto_set_priority
  BEFORE INSERT ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_set_priority();

DROP TRIGGER IF EXISTS trigger_auto_tag_submission ON form_submissions;
CREATE TRIGGER trigger_auto_tag_submission
  BEFORE INSERT ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_tag_submission();

DROP TRIGGER IF EXISTS trigger_auto_assign_submission ON form_submissions;
CREATE TRIGGER trigger_auto_assign_submission
  BEFORE INSERT ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_submission();

DROP TRIGGER IF EXISTS trigger_notify_status_change ON form_submissions;
CREATE TRIGGER trigger_notify_status_change
  AFTER UPDATE ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_status_change();