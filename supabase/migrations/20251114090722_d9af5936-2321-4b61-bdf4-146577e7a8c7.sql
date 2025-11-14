-- Add validation fields to alert_predictions table
ALTER TABLE alert_predictions 
ADD COLUMN IF NOT EXISTS actual_alert_triggered BOOLEAN,
ADD COLUMN IF NOT EXISTS prediction_accuracy DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster validation queries
CREATE INDEX IF NOT EXISTS idx_alert_predictions_validated 
ON alert_predictions(validated_at) 
WHERE validated_at IS NOT NULL;

-- Create index for unvalidated predictions
CREATE INDEX IF NOT EXISTS idx_alert_predictions_unvalidated 
ON alert_predictions(prediction_date) 
WHERE validated_at IS NULL;