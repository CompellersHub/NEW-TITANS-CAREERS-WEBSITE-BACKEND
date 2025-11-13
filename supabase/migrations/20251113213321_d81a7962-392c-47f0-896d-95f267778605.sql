-- Add SLA tracking fields to form_submissions
ALTER TABLE form_submissions
ADD COLUMN IF NOT EXISTS sla_deadline timestamp with time zone,
ADD COLUMN IF NOT EXISTS sla_status text DEFAULT 'on_track' CHECK (sla_status IN ('on_track', 'approaching', 'overdue'));

-- Create index for SLA queries
CREATE INDEX IF NOT EXISTS idx_form_submissions_sla_deadline ON form_submissions(sla_deadline);
CREATE INDEX IF NOT EXISTS idx_form_submissions_sla_status ON form_submissions(sla_status);

-- Function to calculate SLA deadline based on priority
CREATE OR REPLACE FUNCTION calculate_sla_deadline(priority_level text, created_at timestamp with time zone)
RETURNS timestamp with time zone AS $$
BEGIN
  CASE priority_level
    WHEN 'high' THEN
      RETURN created_at + INTERVAL '1 hour';
    WHEN 'medium' THEN
      RETURN created_at + INTERVAL '24 hours';
    WHEN 'low' THEN
      RETURN created_at + INTERVAL '48 hours';
    ELSE
      RETURN created_at + INTERVAL '24 hours';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate SLA status based on deadline
CREATE OR REPLACE FUNCTION calculate_sla_status(deadline timestamp with time zone, current_status text)
RETURNS text AS $$
DECLARE
  time_remaining interval;
  total_time interval;
BEGIN
  -- If submission is resolved or archived, SLA is met
  IF current_status IN ('resolved', 'archived') THEN
    RETURN 'met';
  END IF;
  
  time_remaining := deadline - now();
  
  -- If past deadline, it's overdue
  IF time_remaining < INTERVAL '0' THEN
    RETURN 'overdue';
  END IF;
  
  -- Calculate total time from creation to deadline
  total_time := deadline - (deadline - time_remaining);
  
  -- If less than 25% of time remaining, it's approaching
  IF time_remaining < (total_time * 0.25) THEN
    RETURN 'approaching';
  END IF;
  
  RETURN 'on_track';
END;
$$ LANGUAGE plpgsql STABLE;

-- Trigger to set SLA deadline on insert
CREATE OR REPLACE FUNCTION set_sla_deadline()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sla_deadline := calculate_sla_deadline(NEW.priority, NEW.created_at);
  NEW.sla_status := calculate_sla_status(NEW.sla_deadline, NEW.status);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_sla_deadline ON form_submissions;
CREATE TRIGGER trigger_set_sla_deadline
  BEFORE INSERT ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION set_sla_deadline();

-- Trigger to update SLA deadline when priority changes
CREATE OR REPLACE FUNCTION update_sla_on_priority_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only recalculate if priority changed and submission is not resolved/archived
  IF OLD.priority IS DISTINCT FROM NEW.priority AND NEW.status NOT IN ('resolved', 'archived') THEN
    NEW.sla_deadline := calculate_sla_deadline(NEW.priority, NEW.created_at);
    NEW.sla_status := calculate_sla_status(NEW.sla_deadline, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sla_on_priority_change ON form_submissions;
CREATE TRIGGER trigger_update_sla_on_priority_change
  BEFORE UPDATE ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_sla_on_priority_change();

-- Trigger to update SLA status when status changes
CREATE OR REPLACE FUNCTION update_sla_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.sla_status := calculate_sla_status(NEW.sla_deadline, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sla_on_status_change ON form_submissions;
CREATE TRIGGER trigger_update_sla_on_status_change
  BEFORE UPDATE ON form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_sla_on_status_change();

-- Backfill SLA deadlines for existing submissions
UPDATE form_submissions
SET 
  sla_deadline = calculate_sla_deadline(priority, created_at),
  sla_status = calculate_sla_status(calculate_sla_deadline(priority, created_at), status)
WHERE sla_deadline IS NULL;