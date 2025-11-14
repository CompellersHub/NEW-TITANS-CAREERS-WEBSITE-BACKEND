-- Add video_url column to course_lessons
ALTER TABLE course_lessons 
ADD COLUMN video_url TEXT;

-- Add video_duration_seconds for better tracking
ALTER TABLE course_lessons 
ADD COLUMN video_duration_seconds INTEGER;

-- Update user_lesson_progress to track video progress
ALTER TABLE user_lesson_progress 
ADD COLUMN video_progress_seconds INTEGER DEFAULT 0,
ADD COLUMN video_watched_percentage NUMERIC DEFAULT 0;

-- Insert sample video URLs for existing lessons (using public domain videos)
UPDATE course_lessons 
SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    video_duration_seconds = 596
WHERE is_free_preview = true;

UPDATE course_lessons 
SET video_url = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    video_duration_seconds = 653
WHERE is_free_preview = false AND module_number = 1;