
-- Fix the calculate_next_send_time trigger to handle first send correctly
-- For the FIRST send (last_sent_at IS NULL), next_send_at should equal scheduled_time
-- For SUBSEQUENT sends, calculate from last_sent_at + interval

CREATE OR REPLACE FUNCTION calculate_next_send_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.recurrence_type = 'none' THEN
    -- Non-recurring: always use scheduled_time
    NEW.next_send_at := NEW.scheduled_time;
  ELSE
    -- Recurring campaigns
    IF NEW.last_sent_at IS NOT NULL THEN
      -- Subsequent sends: calculate from last_sent_at
      IF NEW.recurrence_type = 'daily' THEN
        NEW.next_send_at := NEW.last_sent_at + INTERVAL '1 day';
      ELSIF NEW.recurrence_type = 'weekly' THEN
        NEW.next_send_at := NEW.last_sent_at + INTERVAL '1 week';
      ELSIF NEW.recurrence_type = 'monthly' THEN
        NEW.next_send_at := NEW.last_sent_at + INTERVAL '1 month';
      END IF;
    ELSE
      -- First send: next_send_at = scheduled_time
      NEW.next_send_at := NEW.scheduled_time;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
