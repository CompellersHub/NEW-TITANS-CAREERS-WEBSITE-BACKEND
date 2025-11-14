-- Add tracking columns for alert acknowledgment and resolution
ALTER TABLE public.recovery_alert_history
ADD COLUMN acknowledged_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN acknowledged_by UUID REFERENCES auth.users(id),
ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN resolved_by UUID REFERENCES auth.users(id),
ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'resolved', 'ignored')),
ADD COLUMN resolution_notes TEXT;

COMMENT ON COLUMN public.recovery_alert_history.acknowledged_at IS 'When the alert was acknowledged by a team member';
COMMENT ON COLUMN public.recovery_alert_history.acknowledged_by IS 'User who acknowledged the alert';
COMMENT ON COLUMN public.recovery_alert_history.resolved_at IS 'When the issue was resolved';
COMMENT ON COLUMN public.recovery_alert_history.resolved_by IS 'User who resolved the alert';
COMMENT ON COLUMN public.recovery_alert_history.status IS 'Current status of the alert';
COMMENT ON COLUMN public.recovery_alert_history.resolution_notes IS 'Notes about how the alert was resolved';

-- Create index for faster queries
CREATE INDEX idx_recovery_alert_history_status ON public.recovery_alert_history(status);
CREATE INDEX idx_recovery_alert_history_sent_at ON public.recovery_alert_history(sent_at);
CREATE INDEX idx_recovery_alert_history_admin_email ON public.recovery_alert_history(admin_email);