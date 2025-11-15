-- Fix RLS policies for ai_advisor_conversations to allow anonymous users to create conversations

-- Drop the problematic policy that requires session context
DROP POLICY IF EXISTS "Users can create conversations with their session" ON ai_advisor_conversations;

-- Drop the existing "Anyone can create conversations" policy
DROP POLICY IF EXISTS "Anyone can create conversations" ON ai_advisor_conversations;

-- Create a simpler INSERT policy that always allows anonymous conversation creation
CREATE POLICY "Allow anonymous conversation creation" 
ON ai_advisor_conversations 
FOR INSERT 
TO public
WITH CHECK (true);

-- Keep existing SELECT policy (Users can view their own conversations by session)
-- Keep existing UPDATE policy (Users can update their own conversations)