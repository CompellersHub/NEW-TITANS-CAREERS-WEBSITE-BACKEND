-- Add geolocation fields to email_engagement_tracking table
ALTER TABLE email_engagement_tracking 
ADD COLUMN ip_address text,
ADD COLUMN country text,
ADD COLUMN country_code text,
ADD COLUMN region text,
ADD COLUMN city text,
ADD COLUMN latitude numeric,
ADD COLUMN longitude numeric;

-- Create index for country queries
CREATE INDEX idx_email_engagement_country ON email_engagement_tracking(country);
CREATE INDEX idx_email_engagement_city ON email_engagement_tracking(city);