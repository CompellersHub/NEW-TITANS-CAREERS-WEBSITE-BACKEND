-- Create email notification preferences table
CREATE TABLE email_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  reply_notifications BOOLEAN DEFAULT true,
  mention_notifications BOOLEAN DEFAULT true,
  frequency TEXT NOT NULL DEFAULT 'instant',
  digest_time INTEGER DEFAULT 9,
  last_digest_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create queued email notifications table for digests
CREATE TABLE queued_email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE queued_email_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_notification_preferences
CREATE POLICY "Users can view own preferences"
  ON email_notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON email_notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON email_notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for queued_email_notifications (system only)
CREATE POLICY "System can manage queued emails"
  ON queued_email_notifications FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_email_preferences_updated_at
  BEFORE UPDATE ON email_notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_email_prefs_user ON email_notification_preferences(user_id);
CREATE INDEX idx_queued_emails_user ON queued_email_notifications(user_id);
CREATE INDEX idx_queued_emails_sent ON queued_email_notifications(sent);

-- Update notification triggers to handle email notifications
CREATE OR REPLACE FUNCTION send_email_notification(
  p_user_id UUID,
  p_notification_type TEXT,
  p_subject TEXT,
  p_content TEXT,
  p_metadata JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
  user_frequency TEXT;
  notify_enabled BOOLEAN;
BEGIN
  -- Get user email and preferences
  SELECT 
    u.email,
    COALESCE(enp.frequency, 'instant'),
    CASE 
      WHEN p_notification_type = 'reply' THEN COALESCE(enp.reply_notifications, true)
      WHEN p_notification_type = 'mention' THEN COALESCE(enp.mention_notifications, true)
      ELSE true
    END
  INTO user_email, user_frequency, notify_enabled
  FROM auth.users u
  LEFT JOIN email_notification_preferences enp ON enp.user_id = u.id
  WHERE u.id = p_user_id;
  
  -- Only proceed if notifications are enabled
  IF NOT notify_enabled THEN
    RETURN;
  END IF;
  
  -- Handle instant notifications
  IF user_frequency = 'instant' THEN
    -- Call edge function to send email immediately
    PERFORM net.http_post(
      url := 'https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/send-discussion-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4'
      ),
      body := jsonb_build_object(
        'to', user_email,
        'subject', p_subject,
        'content', p_content,
        'metadata', p_metadata
      )
    );
  ELSE
    -- Queue for digest
    INSERT INTO queued_email_notifications (
      user_id,
      notification_type,
      subject,
      content,
      metadata
    ) VALUES (
      p_user_id,
      p_notification_type,
      p_subject,
      p_content,
      p_metadata
    );
  END IF;
END;
$$;

-- Update the reply notification function to include email
CREATE OR REPLACE FUNCTION notify_thread_author()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  thread_author_id UUID;
  thread_title TEXT;
  course_slug_val TEXT;
BEGIN
  -- Get thread details
  SELECT author_id, title, course_slug 
  INTO thread_author_id, thread_title, course_slug_val
  FROM discussion_threads
  WHERE id = NEW.thread_id;
  
  -- Don't notify if replying to own thread
  IF thread_author_id = NEW.author_id THEN
    RETURN NEW;
  END IF;
  
  -- Create in-app notification
  INSERT INTO user_notifications (
    user_id,
    type,
    title,
    message,
    thread_id,
    reply_id,
    metadata
  ) VALUES (
    thread_author_id,
    'reply',
    'New reply on your thread',
    NEW.author_name || ' replied to "' || thread_title || '"',
    NEW.thread_id,
    NEW.id,
    jsonb_build_object(
      'author_name', NEW.author_name,
      'preview', substring(NEW.content FROM 1 FOR 100),
      'course_slug', course_slug_val
    )
  );
  
  -- Send email notification
  PERFORM send_email_notification(
    thread_author_id,
    'reply',
    'New reply on your thread',
    NEW.author_name || ' replied to your discussion "' || thread_title || '": ' || substring(NEW.content FROM 1 FOR 200),
    jsonb_build_object(
      'thread_id', NEW.thread_id,
      'reply_id', NEW.id,
      'author_name', NEW.author_name,
      'thread_title', thread_title,
      'course_slug', course_slug_val,
      'preview', substring(NEW.content FROM 1 FOR 100)
    )
  );
  
  RETURN NEW;
END;
$$;

-- Update the mention notification function to include email
CREATE OR REPLACE FUNCTION notify_mentions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  mentioned_user_id UUID;
  mentioned_name TEXT;
  thread_title TEXT;
  course_slug_val TEXT;
  mention_pattern TEXT := '@\w+';
  mention TEXT;
BEGIN
  -- Get thread details
  SELECT title, course_slug INTO thread_title, course_slug_val
  FROM discussion_threads
  WHERE id = NEW.thread_id;
  
  -- Extract mentions from content
  FOR mention IN 
    SELECT regexp_matches(NEW.content, mention_pattern, 'g')
  LOOP
    mentioned_name := trim(substring(mention FROM 2));
    
    -- Find user by name
    SELECT p.id INTO mentioned_user_id
    FROM profiles p
    WHERE lower(p.full_name) = lower(mentioned_name)
    LIMIT 1;
    
    -- Create notifications if user found and not self-mention
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.author_id THEN
      -- In-app notification
      INSERT INTO user_notifications (
        user_id,
        type,
        title,
        message,
        thread_id,
        reply_id,
        metadata
      ) VALUES (
        mentioned_user_id,
        'mention',
        'You were mentioned',
        NEW.author_name || ' mentioned you in "' || thread_title || '"',
        NEW.thread_id,
        NEW.id,
        jsonb_build_object(
          'author_name', NEW.author_name,
          'preview', substring(NEW.content FROM 1 FOR 100),
          'course_slug', course_slug_val
        )
      ) ON CONFLICT DO NOTHING;
      
      -- Email notification
      PERFORM send_email_notification(
        mentioned_user_id,
        'mention',
        'You were mentioned in a discussion',
        NEW.author_name || ' mentioned you in "' || thread_title || '": ' || substring(NEW.content FROM 1 FOR 200),
        jsonb_build_object(
          'thread_id', NEW.thread_id,
          'reply_id', NEW.id,
          'author_name', NEW.author_name,
          'thread_title', thread_title,
          'course_slug', course_slug_val,
          'preview', substring(NEW.content FROM 1 FOR 100)
        )
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;