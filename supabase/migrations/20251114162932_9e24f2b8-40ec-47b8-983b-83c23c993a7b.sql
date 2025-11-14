-- Drop existing overly permissive policies on ai_advisor_conversations
DROP POLICY IF EXISTS "Anyone can view their conversations by session_id" ON ai_advisor_conversations;
DROP POLICY IF EXISTS "Anyone can update their conversations" ON ai_advisor_conversations;

-- Drop existing overly permissive policies on ai_advisor_messages
DROP POLICY IF EXISTS "Anyone can view messages" ON ai_advisor_messages;

-- Create secure session-based policies for ai_advisor_conversations
CREATE POLICY "Users can view their own conversations by session"
ON ai_advisor_conversations
FOR SELECT
USING (
  session_id = current_setting('app.session_id', true)
  OR 
  (email IS NOT NULL AND email = current_setting('app.user_email', true))
);

CREATE POLICY "Users can create conversations with their session"
ON ai_advisor_conversations
FOR INSERT
WITH CHECK (
  session_id = current_setting('app.session_id', true)
);

CREATE POLICY "Users can update their own conversations"
ON ai_advisor_conversations
FOR UPDATE
USING (
  session_id = current_setting('app.session_id', true)
  OR
  (email IS NOT NULL AND email = current_setting('app.user_email', true))
);

-- Create secure session-based policies for ai_advisor_messages
CREATE POLICY "Users can view messages from their conversations"
ON ai_advisor_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ai_advisor_conversations
    WHERE ai_advisor_conversations.id = ai_advisor_messages.conversation_id
    AND (
      ai_advisor_conversations.session_id = current_setting('app.session_id', true)
      OR
      (ai_advisor_conversations.email IS NOT NULL AND ai_advisor_conversations.email = current_setting('app.user_email', true))
    )
  )
);

CREATE POLICY "Users can create messages in their conversations"
ON ai_advisor_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ai_advisor_conversations
    WHERE ai_advisor_conversations.id = ai_advisor_messages.conversation_id
    AND (
      ai_advisor_conversations.session_id = current_setting('app.session_id', true)
      OR
      (ai_advisor_conversations.email IS NOT NULL AND ai_advisor_conversations.email = current_setting('app.user_email', true))
    )
  )
);