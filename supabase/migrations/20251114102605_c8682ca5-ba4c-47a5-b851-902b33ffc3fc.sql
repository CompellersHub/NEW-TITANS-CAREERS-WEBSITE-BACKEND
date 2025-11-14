-- Create discussion threads table
CREATE TABLE discussion_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug TEXT NOT NULL,
  module_number INTEGER,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create discussion replies table
CREATE TABLE discussion_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_solution BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create thread likes table
CREATE TABLE thread_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(thread_id, user_id)
);

-- Create reply likes table
CREATE TABLE reply_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reply_id UUID NOT NULL REFERENCES discussion_replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(reply_id, user_id)
);

-- Enable RLS
ALTER TABLE discussion_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE thread_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_likes ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is enrolled in course
CREATE OR REPLACE FUNCTION is_enrolled_in_course(p_user_id UUID, p_course_slug TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get user email from profiles
  SELECT (SELECT email FROM auth.users WHERE id = p_user_id)
  INTO user_email;
  
  -- Check if enrolled
  RETURN EXISTS (
    SELECT 1 FROM enrollments 
    WHERE customer_email = user_email 
    AND course_slug = p_course_slug
  );
END;
$$;

-- RLS Policies for discussion_threads
CREATE POLICY "Enrolled users can view threads"
  ON discussion_threads FOR SELECT
  USING (is_enrolled_in_course(auth.uid(), course_slug) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Enrolled users can create threads"
  ON discussion_threads FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND 
    is_enrolled_in_course(auth.uid(), course_slug)
  );

CREATE POLICY "Authors and admins can update threads"
  ON discussion_threads FOR UPDATE
  USING (
    auth.uid() = author_id OR 
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authors and admins can delete threads"
  ON discussion_threads FOR DELETE
  USING (
    auth.uid() = author_id OR 
    has_role(auth.uid(), 'admin')
  );

-- RLS Policies for discussion_replies
CREATE POLICY "Anyone can view replies if they can view thread"
  ON discussion_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM discussion_threads 
      WHERE id = thread_id 
      AND (is_enrolled_in_course(auth.uid(), course_slug) OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Enrolled users can create replies"
  ON discussion_replies FOR INSERT
  WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM discussion_threads 
      WHERE id = thread_id 
      AND is_enrolled_in_course(auth.uid(), course_slug)
    )
  );

CREATE POLICY "Authors and admins can update replies"
  ON discussion_replies FOR UPDATE
  USING (
    auth.uid() = author_id OR 
    has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Authors and admins can delete replies"
  ON discussion_replies FOR DELETE
  USING (
    auth.uid() = author_id OR 
    has_role(auth.uid(), 'admin')
  );

-- RLS Policies for likes
CREATE POLICY "Anyone can view likes"
  ON thread_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own thread likes"
  ON thread_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view reply likes"
  ON reply_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own reply likes"
  ON reply_likes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_discussion_threads_updated_at
  BEFORE UPDATE ON discussion_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at
  BEFORE UPDATE ON discussion_replies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_threads_course ON discussion_threads(course_slug);
CREATE INDEX idx_threads_lesson ON discussion_threads(lesson_id);
CREATE INDEX idx_threads_module ON discussion_threads(module_number);
CREATE INDEX idx_replies_thread ON discussion_replies(thread_id);
CREATE INDEX idx_thread_likes_thread ON thread_likes(thread_id);
CREATE INDEX idx_reply_likes_reply ON reply_likes(reply_id);