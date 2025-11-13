-- Add fields to track automatic summary sending
ALTER TABLE ai_advisor_conversations
ADD COLUMN auto_summary_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN auto_summary_sent_at TIMESTAMP WITH TIME ZONE;

-- Add index for finding inactive conversations
CREATE INDEX idx_conversations_inactive ON ai_advisor_conversations(last_message_at, auto_summary_sent, email)
WHERE email IS NOT NULL AND auto_summary_sent = FALSE;