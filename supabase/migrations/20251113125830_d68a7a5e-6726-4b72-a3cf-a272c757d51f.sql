-- AI Advisor Conversation History
CREATE TABLE IF NOT EXISTS public.ai_advisor_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  session_id TEXT NOT NULL UNIQUE,
  title TEXT,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  message_count INTEGER NOT NULL DEFAULT 0,
  lead_captured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_advisor_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.ai_advisor_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_advisor_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_advisor_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public access for conversations
CREATE POLICY "Anyone can create conversations"
  ON public.ai_advisor_conversations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their conversations by session_id"
  ON public.ai_advisor_conversations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update their conversations"
  ON public.ai_advisor_conversations FOR UPDATE
  USING (true);

-- RLS Policies - Allow public access for messages
CREATE POLICY "Anyone can create messages"
  ON public.ai_advisor_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
  ON public.ai_advisor_messages FOR SELECT
  USING (true);

-- Index for performance
CREATE INDEX idx_ai_advisor_conversations_email ON public.ai_advisor_conversations(email);
CREATE INDEX idx_ai_advisor_conversations_session ON public.ai_advisor_conversations(session_id);
CREATE INDEX idx_ai_advisor_messages_conversation ON public.ai_advisor_messages(conversation_id);

-- Function to auto-generate conversation title from first user message
CREATE OR REPLACE FUNCTION public.generate_conversation_title()
RETURNS TRIGGER AS $$
DECLARE
  first_user_message TEXT;
BEGIN
  IF NEW.role = 'user' AND (
    SELECT title FROM public.ai_advisor_conversations WHERE id = NEW.conversation_id
  ) IS NULL THEN
    -- Get the content and create a title
    first_user_message := substring(NEW.content FROM 1 FOR 50);
    IF length(NEW.content) > 50 THEN
      first_user_message := first_user_message || '...';
    END IF;
    
    UPDATE public.ai_advisor_conversations
    SET title = first_user_message
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to generate title
CREATE TRIGGER generate_conversation_title_trigger
  AFTER INSERT ON public.ai_advisor_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_conversation_title();

-- Function to update conversation stats
CREATE OR REPLACE FUNCTION public.update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.ai_advisor_conversations
  SET 
    message_count = (
      SELECT COUNT(*) 
      FROM public.ai_advisor_messages 
      WHERE conversation_id = NEW.conversation_id
    ),
    last_message_at = now()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update stats
CREATE TRIGGER update_conversation_stats_trigger
  AFTER INSERT ON public.ai_advisor_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_stats();