-- Add segmentation fields to newsletter_subscribers
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN tags text[] DEFAULT '{}',
  ADD COLUMN engagement_score integer DEFAULT 0 CHECK (engagement_score >= 0 AND engagement_score <= 100),
  ADD COLUMN last_engagement_at timestamptz,
  ADD COLUMN total_opens integer DEFAULT 0,
  ADD COLUMN total_clicks integer DEFAULT 0;

-- Create subscriber segments table
CREATE TABLE public.subscriber_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  filter_rules jsonb NOT NULL DEFAULT '{}',
  tags_include text[] DEFAULT '{}',
  tags_exclude text[] DEFAULT '{}',
  min_engagement_score integer DEFAULT 0,
  max_engagement_score integer DEFAULT 100,
  subscriber_count integer DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create engagement events table
CREATE TABLE public.engagement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id uuid NOT NULL REFERENCES public.newsletter_subscribers(id) ON DELETE CASCADE,
  campaign_id uuid,
  event_type text NOT NULL CHECK (event_type IN ('open', 'click', 'unsubscribe')),
  event_data jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriber_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriber_segments
CREATE POLICY "Admins can view segments"
  ON public.subscriber_segments FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert segments"
  ON public.subscriber_segments FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update segments"
  ON public.subscriber_segments FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete segments"
  ON public.subscriber_segments FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for engagement_events
CREATE POLICY "Admins can view engagement events"
  ON public.engagement_events FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert engagement events"
  ON public.engagement_events FOR INSERT
  WITH CHECK (true);

-- Add indexes
CREATE INDEX idx_newsletter_subscribers_tags ON public.newsletter_subscribers USING GIN(tags);
CREATE INDEX idx_newsletter_subscribers_engagement_score ON public.newsletter_subscribers(engagement_score);
CREATE INDEX idx_engagement_events_subscriber_id ON public.engagement_events(subscriber_id);
CREATE INDEX idx_engagement_events_campaign_id ON public.engagement_events(campaign_id);
CREATE INDEX idx_engagement_events_type ON public.engagement_events(event_type);
CREATE INDEX idx_subscriber_segments_tags ON public.subscriber_segments USING GIN(tags_include, tags_exclude);

-- Add trigger for subscriber_segments updated_at
CREATE TRIGGER update_subscriber_segments_updated_at
  BEFORE UPDATE ON public.subscriber_segments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION public.calculate_engagement_score(subscriber_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  opens_count integer;
  clicks_count integer;
  days_since_subscribe integer;
  score integer;
BEGIN
  -- Get event counts
  SELECT 
    COALESCE(SUM(CASE WHEN event_type = 'open' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN event_type = 'click' THEN 1 ELSE 0 END), 0)
  INTO opens_count, clicks_count
  FROM engagement_events
  WHERE engagement_events.subscriber_id = calculate_engagement_score.subscriber_id
    AND created_at > now() - interval '90 days';

  -- Get days since subscription
  SELECT EXTRACT(DAY FROM now() - subscribed_at)::integer
  INTO days_since_subscribe
  FROM newsletter_subscribers
  WHERE id = calculate_engagement_score.subscriber_id;

  -- Calculate score (0-100)
  -- Opens: up to 40 points (capped at 20 opens)
  -- Clicks: up to 60 points (capped at 10 clicks)
  score := LEAST(40, opens_count * 2) + LEAST(60, clicks_count * 6);

  -- Reduce score if inactive for long time
  IF days_since_subscribe > 90 AND opens_count = 0 THEN
    score := score / 2;
  END IF;

  RETURN LEAST(100, score);
END;
$$;

-- Function to update engagement scores for all subscribers
CREATE OR REPLACE FUNCTION public.update_all_engagement_scores()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE newsletter_subscribers
  SET 
    engagement_score = public.calculate_engagement_score(id),
    total_opens = (
      SELECT COUNT(*) 
      FROM engagement_events 
      WHERE engagement_events.subscriber_id = newsletter_subscribers.id 
        AND event_type = 'open'
    ),
    total_clicks = (
      SELECT COUNT(*) 
      FROM engagement_events 
      WHERE engagement_events.subscriber_id = newsletter_subscribers.id 
        AND event_type = 'click'
    ),
    last_engagement_at = (
      SELECT MAX(created_at)
      FROM engagement_events
      WHERE engagement_events.subscriber_id = newsletter_subscribers.id
    );
END;
$$;

-- Function to get segment subscriber count
CREATE OR REPLACE FUNCTION public.get_segment_count(segment_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  segment_row subscriber_segments%ROWTYPE;
  count_result integer;
BEGIN
  SELECT * INTO segment_row FROM subscriber_segments WHERE id = segment_id;
  
  SELECT COUNT(*)
  INTO count_result
  FROM newsletter_subscribers
  WHERE active = true
    AND (
      segment_row.tags_include = '{}' 
      OR tags && segment_row.tags_include
    )
    AND (
      segment_row.tags_exclude = '{}' 
      OR NOT (tags && segment_row.tags_exclude)
    )
    AND engagement_score >= segment_row.min_engagement_score
    AND engagement_score <= segment_row.max_engagement_score;
  
  RETURN count_result;
END;
$$;