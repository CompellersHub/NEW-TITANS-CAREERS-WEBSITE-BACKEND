-- Create table to track SLA alerts sent (prevent duplicates)
CREATE TABLE IF NOT EXISTS sla_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
  alert_type text NOT NULL CHECK (alert_type IN ('approaching', 'overdue', 'compliance_low')),
  sent_to uuid NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  alert_data jsonb DEFAULT '{}'::jsonb,
  UNIQUE(submission_id, alert_type, sent_to)
);

CREATE INDEX idx_sla_alerts_submission ON sla_alerts(submission_id);
CREATE INDEX idx_sla_alerts_sent_to ON sla_alerts(sent_to);
CREATE INDEX idx_sla_alerts_sent_at ON sla_alerts(sent_at);

-- Create in-app notifications table
CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  notification_type text NOT NULL CHECK (notification_type IN ('sla_approaching', 'sla_overdue', 'sla_compliance_low', 'submission_assigned', 'status_changed')),
  title text NOT NULL,
  message text NOT NULL,
  related_submission_id uuid REFERENCES form_submissions(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_notifications_user ON admin_notifications(admin_user_id);
CREATE INDEX idx_admin_notifications_read ON admin_notifications(read);
CREATE INDEX idx_admin_notifications_created ON admin_notifications(created_at DESC);

-- Enable RLS for both tables
ALTER TABLE sla_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for sla_alerts
CREATE POLICY "Admins can view all sla_alerts"
  ON sla_alerts FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert sla_alerts"
  ON sla_alerts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS policies for admin_notifications
CREATE POLICY "Admins can view own notifications"
  ON admin_notifications FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin') AND admin_user_id = auth.uid());

CREATE POLICY "Admins can update own notifications"
  ON admin_notifications FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin') AND admin_user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON admin_notifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to check and send SLA alerts
CREATE OR REPLACE FUNCTION check_and_send_sla_alerts()
RETURNS void AS $$
DECLARE
  submission_record record;
  admin_email text;
  time_remaining interval;
  total_time interval;
  alert_sent boolean;
BEGIN
  -- Check all active submissions with assigned admins
  FOR submission_record IN
    SELECT fs.*, anp.email as admin_email
    FROM form_submissions fs
    LEFT JOIN admin_notification_preferences anp ON anp.admin_user_id = fs.assigned_to
    WHERE fs.status NOT IN ('resolved', 'archived')
      AND fs.assigned_to IS NOT NULL
      AND fs.sla_deadline IS NOT NULL
      AND anp.instant_alerts = true
  LOOP
    time_remaining := submission_record.sla_deadline - now();
    
    -- Calculate if approaching (less than 25% time remaining)
    IF time_remaining > INTERVAL '0' THEN
      total_time := submission_record.sla_deadline - submission_record.created_at;
      
      -- Check if approaching deadline (25% or less time remaining)
      IF time_remaining < (total_time * 0.25) THEN
        -- Check if alert already sent
        SELECT EXISTS(
          SELECT 1 FROM sla_alerts 
          WHERE submission_id = submission_record.id 
            AND alert_type = 'approaching' 
            AND sent_to = submission_record.assigned_to
        ) INTO alert_sent;
        
        IF NOT alert_sent THEN
          -- Create in-app notification
          INSERT INTO admin_notifications (
            admin_user_id,
            notification_type,
            title,
            message,
            related_submission_id,
            metadata
          ) VALUES (
            submission_record.assigned_to,
            'sla_approaching',
            'SLA Deadline Approaching',
            format('Submission #%s is approaching its SLA deadline. Only %s remaining.', 
              SUBSTRING(submission_record.id::text FROM 1 FOR 8),
              to_char(time_remaining, 'HH24:MI')
            ),
            submission_record.id,
            jsonb_build_object(
              'priority', submission_record.priority,
              'form_type', submission_record.form_type,
              'time_remaining', extract(epoch from time_remaining)
            )
          );
          
          -- Send email notification via edge function
          PERFORM net.http_post(
            url := 'https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/send-sla-alert',
            headers := jsonb_build_object(
              'Content-Type', 'application/json',
              'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4'
            ),
            body := jsonb_build_object(
              'alert_type', 'approaching',
              'submission_id', submission_record.id,
              'admin_email', submission_record.admin_email,
              'priority', submission_record.priority,
              'form_type', submission_record.form_type,
              'time_remaining', extract(epoch from time_remaining)
            )
          );
          
          -- Record alert as sent
          INSERT INTO sla_alerts (submission_id, alert_type, sent_to)
          VALUES (submission_record.id, 'approaching', submission_record.assigned_to);
        END IF;
      END IF;
    ELSE
      -- Submission is overdue
      SELECT EXISTS(
        SELECT 1 FROM sla_alerts 
        WHERE submission_id = submission_record.id 
          AND alert_type = 'overdue' 
          AND sent_to = submission_record.assigned_to
      ) INTO alert_sent;
      
      IF NOT alert_sent THEN
        -- Create in-app notification
        INSERT INTO admin_notifications (
          admin_user_id,
          notification_type,
          title,
          message,
          related_submission_id,
          metadata
        ) VALUES (
          submission_record.assigned_to,
          'sla_overdue',
          '⚠️ SLA Deadline Overdue',
          format('Submission #%s is now OVERDUE by %s!', 
            SUBSTRING(submission_record.id::text FROM 1 FOR 8),
            to_char(-time_remaining, 'HH24:MI')
          ),
          submission_record.id,
          jsonb_build_object(
            'priority', submission_record.priority,
            'form_type', submission_record.form_type,
            'overdue_by', extract(epoch from -time_remaining)
          )
        );
        
        -- Send email notification
        PERFORM net.http_post(
          url := 'https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/send-sla-alert',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4'
          ),
          body := jsonb_build_object(
            'alert_type', 'overdue',
            'submission_id', submission_record.id,
            'admin_email', submission_record.admin_email,
            'priority', submission_record.priority,
            'form_type', submission_record.form_type,
            'overdue_by', extract(epoch from -time_remaining)
          )
        );
        
        -- Record alert as sent
        INSERT INTO sla_alerts (submission_id, alert_type, sent_to)
        VALUES (submission_record.id, 'overdue', submission_record.assigned_to);
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to check team-wide SLA compliance
CREATE OR REPLACE FUNCTION check_team_sla_compliance()
RETURNS void AS $$
DECLARE
  compliance_rate numeric;
  admin_record record;
  alert_sent boolean;
BEGIN
  -- Calculate team-wide SLA compliance for last 7 days
  SELECT 
    ROUND(
      COUNT(CASE WHEN sla_status = 'met' OR status IN ('resolved', 'archived') THEN 1 END)::numeric / 
      NULLIF(COUNT(*), 0) * 100, 
      2
    ) INTO compliance_rate
  FROM form_submissions
  WHERE created_at >= CURRENT_DATE - INTERVAL '7 days';
  
  -- If compliance is below 80%, alert all admins
  IF compliance_rate < 80 THEN
    FOR admin_record IN
      SELECT DISTINCT admin_user_id, email
      FROM admin_notification_preferences
      WHERE instant_alerts = true
    LOOP
      -- Check if compliance alert was sent in last 24 hours
      SELECT EXISTS(
        SELECT 1 FROM sla_alerts 
        WHERE alert_type = 'compliance_low' 
          AND sent_to = admin_record.admin_user_id
          AND sent_at > now() - INTERVAL '24 hours'
      ) INTO alert_sent;
      
      IF NOT alert_sent THEN
        -- Create in-app notification
        INSERT INTO admin_notifications (
          admin_user_id,
          notification_type,
          title,
          message,
          metadata
        ) VALUES (
          admin_record.admin_user_id,
          'sla_compliance_low',
          '🚨 Low SLA Compliance Alert',
          format('Team SLA compliance has dropped to %s%% (below 80%% threshold). Immediate attention required.', 
            compliance_rate
          ),
          jsonb_build_object(
            'compliance_rate', compliance_rate,
            'threshold', 80
          )
        );
        
        -- Send email notification
        PERFORM net.http_post(
          url := 'https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/send-sla-alert',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4'
          ),
          body := jsonb_build_object(
            'alert_type', 'compliance_low',
            'admin_email', admin_record.email,
            'compliance_rate', compliance_rate
          )
        );
        
        -- Record alert as sent
        INSERT INTO sla_alerts (submission_id, alert_type, sent_to, alert_data)
        VALUES (
          '00000000-0000-0000-0000-000000000000'::uuid, 
          'compliance_low', 
          admin_record.admin_user_id,
          jsonb_build_object('compliance_rate', compliance_rate)
        )
        ON CONFLICT (submission_id, alert_type, sent_to) DO NOTHING;
      END IF;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;