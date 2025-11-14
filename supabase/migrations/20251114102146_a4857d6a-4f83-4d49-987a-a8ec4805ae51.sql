-- Create module_quizzes table
CREATE TABLE module_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug TEXT NOT NULL,
  module_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_slug, module_number)
);

-- Create quiz_questions table
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES module_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER NOT NULL DEFAULT 1,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create quiz_attempts table
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quiz_id UUID NOT NULL REFERENCES module_quizzes(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  time_taken_seconds INTEGER,
  answers JSONB NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE module_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for module_quizzes
CREATE POLICY "Anyone can view quizzes"
  ON module_quizzes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage quizzes"
  ON module_quizzes FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for quiz_questions
CREATE POLICY "Anyone can view quiz questions"
  ON quiz_questions FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage questions"
  ON quiz_questions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view own attempts"
  ON quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts"
  ON quiz_attempts FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_module_quizzes_updated_at
  BEFORE UPDATE ON module_quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample quizzes and questions for existing courses
INSERT INTO module_quizzes (course_slug, module_number, title, description, passing_score)
VALUES 
  ('aml-kyc', 1, 'Module 1 Quiz: AML Fundamentals', 'Test your knowledge of AML basics', 70),
  ('data-analysis', 1, 'Module 1 Quiz: Data Analysis Basics', 'Test your understanding of data analysis fundamentals', 70),
  ('cybersecurity', 1, 'Module 1 Quiz: Security Fundamentals', 'Test your knowledge of cybersecurity basics', 70);

-- Insert sample questions for AML course
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation, order_number)
SELECT 
  mq.id,
  'What does AML stand for?',
  '["Anti-Money Laundering", "Advanced Machine Learning", "Automated Money Logic", "Asset Management Law"]'::jsonb,
  'Anti-Money Laundering',
  'AML stands for Anti-Money Laundering, which refers to the laws and regulations designed to prevent criminals from disguising illegally obtained funds as legitimate income.',
  1
FROM module_quizzes mq WHERE mq.course_slug = 'aml-kyc' AND mq.module_number = 1;

INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation, order_number)
SELECT 
  mq.id,
  'What is the primary purpose of KYC?',
  '["To verify customer identity", "To increase sales", "To reduce costs", "To track employees"]'::jsonb,
  'To verify customer identity',
  'Know Your Customer (KYC) procedures are used to verify the identity of customers to prevent fraud and money laundering.',
  2
FROM module_quizzes mq WHERE mq.course_slug = 'aml-kyc' AND mq.module_number = 1;

INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation, order_number)
SELECT 
  mq.id,
  'Which of the following is a red flag for money laundering?',
  '["Large cash deposits", "Regular paycheck deposits", "Utility bill payments", "Small debit card purchases"]'::jsonb,
  'Large cash deposits',
  'Large cash deposits, especially those that are structured to avoid reporting thresholds, are considered red flags for potential money laundering.',
  3
FROM module_quizzes mq WHERE mq.course_slug = 'aml-kyc' AND mq.module_number = 1;

-- Insert sample questions for Data Analysis course
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation, order_number)
SELECT 
  mq.id,
  'What is the difference between qualitative and quantitative data?',
  '["Qualitative describes qualities, quantitative uses numbers", "They are the same", "Qualitative is better", "Quantitative is easier to collect"]'::jsonb,
  'Qualitative describes qualities, quantitative uses numbers',
  'Qualitative data describes qualities or characteristics, while quantitative data is numerical and can be measured.',
  1
FROM module_quizzes mq WHERE mq.course_slug = 'data-analysis' AND mq.module_number = 1;

INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation, order_number)
SELECT 
  mq.id,
  'What does the mean represent in a dataset?',
  '["The average value", "The most common value", "The middle value", "The range of values"]'::jsonb,
  'The average value',
  'The mean is the average value calculated by summing all values and dividing by the count of values.',
  2
FROM module_quizzes mq WHERE mq.course_slug = 'data-analysis' AND mq.module_number = 1;

-- Insert sample questions for Cybersecurity course
INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation, order_number)
SELECT 
  mq.id,
  'What is the purpose of encryption?',
  '["To protect data confidentiality", "To speed up processing", "To reduce file size", "To organize files"]'::jsonb,
  'To protect data confidentiality',
  'Encryption converts data into a coded format to protect its confidentiality from unauthorized access.',
  1
FROM module_quizzes mq WHERE mq.course_slug = 'cybersecurity' AND mq.module_number = 1;

INSERT INTO quiz_questions (quiz_id, question_text, options, correct_answer, explanation, order_number)
SELECT 
  mq.id,
  'What is phishing?',
  '["A fraudulent attempt to obtain sensitive information", "A type of antivirus software", "A network protocol", "A programming language"]'::jsonb,
  'A fraudulent attempt to obtain sensitive information',
  'Phishing is a social engineering attack where attackers impersonate trusted entities to trick victims into revealing sensitive information.',
  2
FROM module_quizzes mq WHERE mq.course_slug = 'cybersecurity' AND mq.module_number = 1;