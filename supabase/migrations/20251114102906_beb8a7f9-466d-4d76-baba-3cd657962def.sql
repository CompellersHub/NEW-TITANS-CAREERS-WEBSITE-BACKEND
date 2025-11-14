-- Create notifications table
CREATE TABLE user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  thread_id UUID REFERENCES discussion_threads(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES discussion_replies(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON user_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
  ON user_notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_notifications_user ON user_notifications(user_id);
CREATE INDEX idx_notifications_read ON user_notifications(read);
CREATE INDEX idx_notifications_created ON user_notifications(created_at DESC);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE user_notifications;

-- Enable realtime for discussion replies (for thread authors to get notified)
ALTER PUBLICATION supabase_realtime ADD TABLE discussion_replies;

-- Create function to notify thread author when reply is added
CREATE OR REPLACE FUNCTION notify_thread_author()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  thread_author_id UUID;
  thread_title TEXT;
BEGIN
  -- Get thread author and title
  SELECT author_id, title INTO thread_author_id, thread_title
  FROM discussion_threads
  WHERE id = NEW.thread_id;
  
  -- Don't notify if replying to own thread
  IF thread_author_id = NEW.author_id THEN
    RETURN NEW;
  END IF;
  
  -- Create notification for thread author
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
      'preview', substring(NEW.content FROM 1 FOR 100)
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for reply notifications
CREATE TRIGGER on_reply_created
  AFTER INSERT ON discussion_replies
  FOR EACH ROW
  EXECUTE FUNCTION notify_thread_author();

-- Create function to detect and notify mentions
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
  mention_pattern TEXT := '@\w+';
  mention TEXT;
BEGIN
  -- Get thread title
  SELECT title INTO thread_title
  FROM discussion_threads
  WHERE id = NEW.thread_id;
  
  -- Extract mentions from content (simple @username pattern)
  FOR mention IN 
    SELECT regexp_matches(NEW.content, mention_pattern, 'g')
  LOOP
    -- Remove @ symbol
    mentioned_name := trim(substring(mention FROM 2));
    
    -- Find user by name (matching profile full_name)
    SELECT p.id INTO mentioned_user_id
    FROM profiles p
    WHERE lower(p.full_name) = lower(mentioned_name)
    LIMIT 1;
    
    -- Create notification if user found and not self-mention
    IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.author_id THEN
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
          'preview', substring(NEW.content FROM 1 FOR 100)
        )
      ) ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for mention notifications
CREATE TRIGGER on_mention_detected
  AFTER INSERT ON discussion_replies
  FOR EACH ROW
  EXECUTE FUNCTION notify_mentions();