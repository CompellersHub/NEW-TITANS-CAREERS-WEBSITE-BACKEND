-- Create courses table based on MongoDB titans.courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE, -- Mapping from 'id' or 'name' (slugified)
  title TEXT NOT NULL, -- Mapping from 'name'
  description TEXT,
  image_url TEXT, -- Mapping from 'course_image'
  preview_video_id TEXT, -- Mapping from 'preview_id'
  preview_description TEXT,
  category TEXT,
  price NUMERIC DEFAULT 0,
  original_price NUMERIC,
  level TEXT,
  estimated_time TEXT,
  instructor_id UUID, -- Mapping from 'instructor' (needs resolution)
  learning_outcomes JSONB DEFAULT '[]'::jsonb,
  target_audience JSONB DEFAULT '[]'::jsonb,
  curriculum JSONB DEFAULT '[]'::jsonb,
  required_materials JSONB DEFAULT '[]'::jsonb,
  course_includes JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create jobs table based on MongoDB titan_jobs.jobs
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  job_type TEXT, -- Mapping from 'type'
  salary_range TEXT, -- Mapping from 'salary'
  application_deadline TIMESTAMP WITH TIME ZONE,
  company_name TEXT,
  company_logo TEXT,
  contact_email TEXT,
  requirements TEXT, -- or JSONB/Array if structured
  responsibilities TEXT,
  benefits TEXT,
  experience_level TEXT, -- Mapping from 'experience'
  education_level TEXT, -- Mapping from 'education'
  apply_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
