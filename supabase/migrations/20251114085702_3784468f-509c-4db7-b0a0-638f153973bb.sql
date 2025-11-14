-- Create table for storing predictive analytics
CREATE TABLE IF NOT EXISTS public.alert_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  prediction_period TEXT NOT NULL, -- 'next_24h', 'next_7d', 'next_30d'
  channel TEXT NOT NULL, -- 'email', 'sms', 'whatsapp', 'overall'
  predicted_alert_probability NUMERIC NOT NULL, -- 0-100
  predicted_conversion_rate NUMERIC,
  predicted_roi NUMERIC,
  confidence_score NUMERIC NOT NULL, -- 0-100
  contributing_factors JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  actual_alert_triggered BOOLEAN,
  prediction_accuracy NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  validated_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster queries
CREATE INDEX idx_alert_predictions_date ON public.alert_predictions(prediction_date DESC);
CREATE INDEX idx_alert_predictions_channel ON public.alert_predictions(channel);
CREATE INDEX idx_alert_predictions_period ON public.alert_predictions(prediction_period);

-- Enable RLS
ALTER TABLE public.alert_predictions ENABLE ROW LEVEL SECURITY;

-- Admins can view predictions
CREATE POLICY "Admins can view predictions"
  ON public.alert_predictions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- System can insert predictions
CREATE POLICY "System can insert predictions"
  ON public.alert_predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- System can update predictions
CREATE POLICY "System can update predictions"
  ON public.alert_predictions
  FOR UPDATE
  TO authenticated
  USING (true);