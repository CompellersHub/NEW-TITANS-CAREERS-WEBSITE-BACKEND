-- Create recovery alert settings table
CREATE TABLE IF NOT EXISTS public.recovery_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_email TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  
  -- Conversion rate thresholds (as percentages)
  email_conversion_threshold NUMERIC DEFAULT 5.0,
  sms_conversion_threshold NUMERIC DEFAULT 8.0,
  whatsapp_conversion_threshold NUMERIC DEFAULT 10.0,
  overall_conversion_threshold NUMERIC DEFAULT 7.0,
  
  -- ROI thresholds
  email_roi_threshold NUMERIC DEFAULT 0,
  sms_roi_threshold NUMERIC DEFAULT 0,
  whatsapp_roi_threshold NUMERIC DEFAULT 0,
  overall_roi_threshold NUMERIC DEFAULT 0,
  
  -- Alert frequency
  check_interval_hours INTEGER DEFAULT 24,
  alert_cooldown_hours INTEGER DEFAULT 6,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create recovery alert history table
CREATE TABLE IF NOT EXISTS public.recovery_alert_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'conversion_drop' or 'negative_roi'
  channel TEXT NOT NULL, -- 'email', 'sms', 'whatsapp', or 'overall'
  metric_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  admin_email TEXT NOT NULL,
  alert_data JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recovery_alert_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_alert_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recovery_alert_settings
CREATE POLICY "Admins can view alert settings"
  ON public.recovery_alert_settings
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert alert settings"
  ON public.recovery_alert_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update alert settings"
  ON public.recovery_alert_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete alert settings"
  ON public.recovery_alert_settings
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for recovery_alert_history
CREATE POLICY "Admins can view alert history"
  ON public.recovery_alert_history
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert alert history"
  ON public.recovery_alert_history
  FOR INSERT
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_recovery_alert_settings_updated_at
  BEFORE UPDATE ON public.recovery_alert_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();