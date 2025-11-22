-- Clean up old upcoming cohorts for the 5 courses we're updating
DELETE FROM public.events 
WHERE course_slug IN ('digital-marketing', 'cybersecurity', 'business-analysis', 'data-privacy', 'crypto-compliance')
AND status = 'upcoming'
AND event_type = 'cohort';

-- Insert Cohort 1 for each course (starting dates as specified by user)

-- Digital Marketing Cohort 1 (8 weeks, Saturday)
INSERT INTO public.events (
  title, course_slug, event_type, start_date, end_date, status, 
  cohort_number, location, description, instructor_name, max_participants,
  metadata
) VALUES (
  'Digital Marketing Cohort 1',
  'digital-marketing',
  'cohort',
  '2025-01-25',
  '2025-03-22',
  'upcoming',
  1,
  'Online',
  'Complete Digital Marketing certification program covering SEO, social media, content marketing, and analytics.',
  'Marketing Team',
  30,
  '{"timezone": "Europe/London", "session_day": "Saturday", "session_time": "Evening session", "duration_weeks": 8, "month_name": "January", "cohort_suffix": " Cohort"}'::jsonb
);

-- Cybersecurity Cohort 1 (12 weeks, Sunday)
INSERT INTO public.events (
  title, course_slug, event_type, start_date, end_date, status, 
  cohort_number, location, description, instructor_name, max_participants,
  metadata
) VALUES (
  'Cybersecurity Cohort 1',
  'cybersecurity',
  'cohort',
  '2025-02-02',
  '2025-04-27',
  'upcoming',
  1,
  'Online',
  'Comprehensive cybersecurity training covering network security, ethical hacking, and threat analysis.',
  'Security Team',
  25,
  '{"timezone": "Europe/London", "session_day": "Sunday", "session_time": "Afternoon session", "duration_weeks": 12, "month_name": "February", "cohort_suffix": " Cohort"}'::jsonb
);

-- Business Analysis Cohort 1 (16 weeks, Saturday)
INSERT INTO public.events (
  title, course_slug, event_type, start_date, end_date, status, 
  cohort_number, location, description, instructor_name, max_participants,
  metadata
) VALUES (
  'Business Analysis Cohort 1',
  'business-analysis',
  'cohort',
  '2025-02-22',
  '2025-06-14',
  'upcoming',
  1,
  'Online',
  'Professional Business Analysis certification covering requirements gathering, process modeling, and stakeholder management.',
  'Business Team',
  30,
  '{"timezone": "Europe/London", "session_day": "Saturday", "session_time": "Evening session", "duration_weeks": 16, "month_name": "February", "cohort_suffix": " Cohort"}'::jsonb
);

-- Data Privacy Cohort 1 (8 weeks, Saturday) - Changed to March 1, 2025 as 2025 is not a leap year
INSERT INTO public.events (
  title, course_slug, event_type, start_date, end_date, status, 
  cohort_number, location, description, instructor_name, max_participants,
  metadata
) VALUES (
  'Data Privacy & Protection Cohort 1',
  'data-privacy',
  'cohort',
  '2025-03-01',
  '2025-04-26',
  'upcoming',
  1,
  'Online',
  'Comprehensive data privacy training covering GDPR, data protection principles, and compliance strategies.',
  'Privacy Team',
  25,
  '{"timezone": "Europe/London", "session_day": "Saturday", "session_time": "Evening session", "duration_weeks": 8, "month_name": "March", "cohort_suffix": " Cohort"}'::jsonb
);

-- Crypto & Digital Assets Cohort 1 (8 weeks, Sunday)
INSERT INTO public.events (
  title, course_slug, event_type, start_date, end_date, status, 
  cohort_number, location, description, instructor_name, max_participants,
  metadata
) VALUES (
  'Crypto & Digital Assets Cohort 1',
  'crypto-compliance',
  'cohort',
  '2025-03-02',
  '2025-04-27',
  'upcoming',
  1,
  'Online',
  'Specialized training in cryptocurrency compliance, blockchain technology, and digital asset regulations.',
  'Compliance Team',
  20,
  '{"timezone": "Europe/London", "session_day": "Sunday", "session_time": "Afternoon session", "duration_weeks": 8, "month_name": "March", "cohort_suffix": " Cohort"}'::jsonb
);

-- Insert Cohort 2 for each course (6 weeks after Cohort 1 ends)

-- Digital Marketing Cohort 2 (starts May 3, 2025)
INSERT INTO public.events (
  title, course_slug, event_type, start_date, end_date, status, 
  cohort_number, location, description, instructor_name, max_participants,
  metadata
) VALUES (
  'Digital Marketing Cohort 2',
  'digital-marketing',
  'cohort',
  '2025-05-03',
  '2025-06-28',
  'upcoming',
  2,
  'Online',
  'Complete Digital Marketing certification program covering SEO, social media, content marketing, and analytics.',
  'Marketing Team',
  30,
  '{"timezone": "Europe/London", "session_day": "Saturday", "session_time": "Evening session", "duration_weeks": 8, "month_name": "May", "cohort_suffix": " Cohort"}'::jsonb
);

-- Cybersecurity Cohort 2 (starts June 8, 2025)
INSERT INTO public.events (
  title, course_slug, event_type, start_date, end_date, status, 
  cohort_number, location, description, instructor_name, max_participants,
  metadata
) VALUES (
  'Cybersecurity Cohort 2',
  'cybersecurity',
  'cohort',
  '2025-06-08',
  '2025-08-31',
  'upcoming',
  2,
  'Online',
  'Comprehensive cybersecurity training covering network security, ethical hacking, and threat analysis.',
  'Security Team',
  25,
  '{"timezone": "Europe/London", "session_day": "Sunday", "session_time": "Afternoon session", "duration_weeks": 12, "month_name": "June", "cohort_suffix": " Cohort"}'::jsonb
);

-- Business Analysis Cohort 2 (starts July 26, 2025)
INSERT INTO public.events (
  title, course_slug, event_type, start_date, end_date, status, 
  cohort_number, location, description, instructor_name, max_participants,
  metadata
) VALUES (
  'Business Analysis Cohort 2',
  'business-analysis',
  'cohort',
  '2025-07-26',
  '2025-11-15',
  'upcoming',
  2,
  'Online',
  'Professional Business Analysis certification covering requirements gathering, process modeling, and stakeholder management.',
  'Business Team',
  30,
  '{"timezone": "Europe/London", "session_day": "Saturday", "session_time": "Evening session", "duration_weeks": 16, "month_name": "July", "cohort_suffix": " Cohort"}'::jsonb
);

-- Data Privacy Cohort 2 (starts June 7, 2025)
INSERT INTO public.events (
  title, course_slug, event_type, start_date, end_date, status, 
  cohort_number, location, description, instructor_name, max_participants,
  metadata
) VALUES (
  'Data Privacy & Protection Cohort 2',
  'data-privacy',
  'cohort',
  '2025-06-07',
  '2025-08-02',
  'upcoming',
  2,
  'Online',
  'Comprehensive data privacy training covering GDPR, data protection principles, and compliance strategies.',
  'Privacy Team',
  25,
  '{"timezone": "Europe/London", "session_day": "Saturday", "session_time": "Evening session", "duration_weeks": 8, "month_name": "June", "cohort_suffix": " Cohort"}'::jsonb
);

-- Crypto & Digital Assets Cohort 2 (starts June 8, 2025)
INSERT INTO public.events (
  title, course_slug, event_type, start_date, end_date, status, 
  cohort_number, location, description, instructor_name, max_participants,
  metadata
) VALUES (
  'Crypto & Digital Assets Cohort 2',
  'crypto-compliance',
  'cohort',
  '2025-06-08',
  '2025-08-03',
  'upcoming',
  2,
  'Online',
  'Specialized training in cryptocurrency compliance, blockchain technology, and digital asset regulations.',
  'Compliance Team',
  20,
  '{"timezone": "Europe/London", "session_day": "Sunday", "session_time": "Afternoon session", "duration_weeks": 8, "month_name": "June", "cohort_suffix": " Cohort"}'::jsonb
);