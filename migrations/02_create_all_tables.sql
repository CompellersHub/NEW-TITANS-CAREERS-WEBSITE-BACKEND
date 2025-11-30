-- Generated SQL to create tables for all MongoDB collections

-- Table for collection: titans.learningoutcomes
DROP TABLE IF EXISTS "learningoutcomes" CASCADE;
CREATE TABLE "learningoutcomes" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_learningoutcomes_mongo_id ON "learningoutcomes" (mongo_id);
CREATE INDEX idx_learningoutcomes_data ON "learningoutcomes" USING gin (data);

-- Table for collection: titans.quiz_questions
DROP TABLE IF EXISTS "quiz_questions" CASCADE;
CREATE TABLE "quiz_questions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_quiz_questions_mongo_id ON "quiz_questions" (mongo_id);
CREATE INDEX idx_quiz_questions_data ON "quiz_questions" USING gin (data);

-- Table for collection: titans.modules
DROP TABLE IF EXISTS "modules" CASCADE;
CREATE TABLE "modules" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_modules_mongo_id ON "modules" (mongo_id);
CREATE INDEX idx_modules_data ON "modules" USING gin (data);

-- Table for collection: titans.submissions
DROP TABLE IF EXISTS "submissions" CASCADE;
CREATE TABLE "submissions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_submissions_mongo_id ON "submissions" (mongo_id);
CREATE INDEX idx_submissions_data ON "submissions" USING gin (data);

-- Table for collection: titans.course_progress
DROP TABLE IF EXISTS "course_progress" CASCADE;
CREATE TABLE "course_progress" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_course_progress_mongo_id ON "course_progress" (mongo_id);
CREATE INDEX idx_course_progress_data ON "course_progress" USING gin (data);

-- Table for collection: titans.monitoring_transactions
DROP TABLE IF EXISTS "monitoring_transactions" CASCADE;
CREATE TABLE "monitoring_transactions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  status TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_monitoring_transactions_mongo_id ON "monitoring_transactions" (mongo_id);
CREATE INDEX idx_monitoring_transactions_data ON "monitoring_transactions" USING gin (data);

-- Table for collection: titans.monitoring_sanctions
DROP TABLE IF EXISTS "monitoring_sanctions" CASCADE;
CREATE TABLE "monitoring_sanctions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_monitoring_sanctions_mongo_id ON "monitoring_sanctions" (mongo_id);
CREATE INDEX idx_monitoring_sanctions_data ON "monitoring_sanctions" USING gin (data);

-- Table for collection: titans.enrollments_transactions
DROP TABLE IF EXISTS "enrollments_transactions" CASCADE;
CREATE TABLE "enrollments_transactions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_enrollments_transactions_mongo_id ON "enrollments_transactions" (mongo_id);
CREATE INDEX idx_enrollments_transactions_data ON "enrollments_transactions" USING gin (data);

-- Table for collection: titans.kyc-training-portals
DROP TABLE IF EXISTS "kyc_training_portals" CASCADE;
CREATE TABLE "kyc_training_portals" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_kyc_training_portals_mongo_id ON "kyc_training_portals" (mongo_id);
CREATE INDEX idx_kyc_training_portals_data ON "kyc_training_portals" USING gin (data);

-- Table for collection: titans.liveclasss
DROP TABLE IF EXISTS "liveclasss" CASCADE;
CREATE TABLE "liveclasss" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_liveclasss_mongo_id ON "liveclasss" (mongo_id);
CREATE INDEX idx_liveclasss_data ON "liveclasss" USING gin (data);

-- Table for collection: titans.coursenotes
DROP TABLE IF EXISTS "coursenotes" CASCADE;
CREATE TABLE "coursenotes" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_coursenotes_mongo_id ON "coursenotes" (mongo_id);
CREATE INDEX idx_coursenotes_data ON "coursenotes" USING gin (data);

-- Table for collection: titans.virtual_accounts
DROP TABLE IF EXISTS "virtual_accounts" CASCADE;
CREATE TABLE "virtual_accounts" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_virtual_accounts_mongo_id ON "virtual_accounts" (mongo_id);
CREATE INDEX idx_virtual_accounts_data ON "virtual_accounts" USING gin (data);

-- Table for collection: titans.target_audiences
DROP TABLE IF EXISTS "target_audiences" CASCADE;
CREATE TABLE "target_audiences" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_target_audiences_mongo_id ON "target_audiences" (mongo_id);
CREATE INDEX idx_target_audiences_data ON "target_audiences" USING gin (data);

-- Table for collection: titans.notifications
DROP TABLE IF EXISTS "notifications" CASCADE;
CREATE TABLE "notifications" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_notifications_mongo_id ON "notifications" (mongo_id);
CREATE INDEX idx_notifications_data ON "notifications" USING gin (data);

-- Table for collection: titans.monitoring_cases
DROP TABLE IF EXISTS "monitoring_cases" CASCADE;
CREATE TABLE "monitoring_cases" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_monitoring_cases_mongo_id ON "monitoring_cases" (mongo_id);
CREATE INDEX idx_monitoring_cases_data ON "monitoring_cases" USING gin (data);

-- Table for collection: titans.categorys
DROP TABLE IF EXISTS "categorys" CASCADE;
CREATE TABLE "categorys" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_categorys_mongo_id ON "categorys" (mongo_id);
CREATE INDEX idx_categorys_data ON "categorys" USING gin (data);

-- Table for collection: titans.watchlists
DROP TABLE IF EXISTS "watchlists" CASCADE;
CREATE TABLE "watchlists" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_watchlists_mongo_id ON "watchlists" (mongo_id);
CREATE INDEX idx_watchlists_data ON "watchlists" USING gin (data);

-- Table for collection: titans.registrations
DROP TABLE IF EXISTS "registrations" CASCADE;
CREATE TABLE "registrations" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  email TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_registrations_mongo_id ON "registrations" (mongo_id);
CREATE INDEX idx_registrations_data ON "registrations" USING gin (data);

-- Table for collection: titans.blogs
DROP TABLE IF EXISTS "blogs" CASCADE;
CREATE TABLE "blogs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  title TEXT,
  slug TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_blogs_mongo_id ON "blogs" (mongo_id);
CREATE INDEX idx_blogs_data ON "blogs" USING gin (data);

-- Table for collection: titans.categories
DROP TABLE IF EXISTS "categories" CASCADE;
CREATE TABLE "categories" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_categories_mongo_id ON "categories" (mongo_id);
CREATE INDEX idx_categories_data ON "categories" USING gin (data);

-- Table for collection: titans.customusers
DROP TABLE IF EXISTS "customusers" CASCADE;
CREATE TABLE "customusers" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  email TEXT,
  username TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_customusers_mongo_id ON "customusers" (mongo_id);
CREATE INDEX idx_customusers_data ON "customusers" USING gin (data);

-- Table for collection: titans.users
DROP TABLE IF EXISTS "users" CASCADE;
CREATE TABLE "users" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  email TEXT,
  username TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_users_mongo_id ON "users" (mongo_id);
CREATE INDEX idx_users_data ON "users" USING gin (data);

-- Table for collection: titans.review_on_searches
DROP TABLE IF EXISTS "review_on_searches" CASCADE;
CREATE TABLE "review_on_searches" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_review_on_searches_mongo_id ON "review_on_searches" (mongo_id);
CREATE INDEX idx_review_on_searches_data ON "review_on_searches" USING gin (data);

-- Table for collection: titans.make_assignments
DROP TABLE IF EXISTS "make_assignments" CASCADE;
CREATE TABLE "make_assignments" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_make_assignments_mongo_id ON "make_assignments" (mongo_id);
CREATE INDEX idx_make_assignments_data ON "make_assignments" USING gin (data);

-- Table for collection: titans.monitoring-cases
DROP TABLE IF EXISTS "monitoring_cases" CASCADE;
CREATE TABLE "monitoring_cases" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_monitoring_cases_mongo_id ON "monitoring_cases" (mongo_id);
CREATE INDEX idx_monitoring_cases_data ON "monitoring_cases" USING gin (data);

-- Table for collection: titans.courses
DROP TABLE IF EXISTS "courses" CASCADE;
CREATE TABLE "courses" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_courses_mongo_id ON "courses" (mongo_id);
CREATE INDEX idx_courses_data ON "courses" USING gin (data);

-- Table for collection: titans.course_library
DROP TABLE IF EXISTS "course_library" CASCADE;
CREATE TABLE "course_library" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_course_library_mongo_id ON "course_library" (mongo_id);
CREATE INDEX idx_course_library_data ON "course_library" USING gin (data);

-- Table for collection: titans.smart_searches
DROP TABLE IF EXISTS "smart_searches" CASCADE;
CREATE TABLE "smart_searches" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_smart_searches_mongo_id ON "smart_searches" (mongo_id);
CREATE INDEX idx_smart_searches_data ON "smart_searches" USING gin (data);

-- Table for collection: titans.bank_transfers
DROP TABLE IF EXISTS "bank_transfers" CASCADE;
CREATE TABLE "bank_transfers" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_bank_transfers_mongo_id ON "bank_transfers" (mongo_id);
CREATE INDEX idx_bank_transfers_data ON "bank_transfers" USING gin (data);

-- Table for collection: titans.courselibrarys
DROP TABLE IF EXISTS "courselibrarys" CASCADE;
CREATE TABLE "courselibrarys" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_courselibrarys_mongo_id ON "courselibrarys" (mongo_id);
CREATE INDEX idx_courselibrarys_data ON "courselibrarys" USING gin (data);

-- Table for collection: titans.courselibraryvideos
DROP TABLE IF EXISTS "courselibraryvideos" CASCADE;
CREATE TABLE "courselibraryvideos" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_courselibraryvideos_mongo_id ON "courselibraryvideos" (mongo_id);
CREATE INDEX idx_courselibraryvideos_data ON "courselibraryvideos" USING gin (data);

-- Table for collection: titans.quiz_enrollments
DROP TABLE IF EXISTS "quiz_enrollments" CASCADE;
CREATE TABLE "quiz_enrollments" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_quiz_enrollments_mongo_id ON "quiz_enrollments" (mongo_id);
CREATE INDEX idx_quiz_enrollments_data ON "quiz_enrollments" USING gin (data);

-- Table for collection: titans.watch_lists
DROP TABLE IF EXISTS "watch_lists" CASCADE;
CREATE TABLE "watch_lists" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_watch_lists_mongo_id ON "watch_lists" (mongo_id);
CREATE INDEX idx_watch_lists_data ON "watch_lists" USING gin (data);

-- Table for collection: titans.monitoring_profiles
DROP TABLE IF EXISTS "monitoring_profiles" CASCADE;
CREATE TABLE "monitoring_profiles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_monitoring_profiles_mongo_id ON "monitoring_profiles" (mongo_id);
CREATE INDEX idx_monitoring_profiles_data ON "monitoring_profiles" USING gin (data);

-- Table for collection: titans.bloguser
DROP TABLE IF EXISTS "bloguser" CASCADE;
CREATE TABLE "bloguser" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  email TEXT,
  username TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_bloguser_mongo_id ON "bloguser" (mongo_id);
CREATE INDEX idx_bloguser_data ON "bloguser" USING gin (data);

-- Table for collection: titans.screening_counts
DROP TABLE IF EXISTS "screening_counts" CASCADE;
CREATE TABLE "screening_counts" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_screening_counts_mongo_id ON "screening_counts" (mongo_id);
CREATE INDEX idx_screening_counts_data ON "screening_counts" USING gin (data);

-- Table for collection: titans.learning_outcomes
DROP TABLE IF EXISTS "learning_outcomes" CASCADE;
CREATE TABLE "learning_outcomes" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_learning_outcomes_mongo_id ON "learning_outcomes" (mongo_id);
CREATE INDEX idx_learning_outcomes_data ON "learning_outcomes" USING gin (data);

-- Table for collection: titans.course_notes
DROP TABLE IF EXISTS "course_notes" CASCADE;
CREATE TABLE "course_notes" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_course_notes_mongo_id ON "course_notes" (mongo_id);
CREATE INDEX idx_course_notes_data ON "course_notes" USING gin (data);

-- Table for collection: titans.targetaudiences
DROP TABLE IF EXISTS "targetaudiences" CASCADE;
CREATE TABLE "targetaudiences" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_targetaudiences_mongo_id ON "targetaudiences" (mongo_id);
CREATE INDEX idx_targetaudiences_data ON "targetaudiences" USING gin (data);

-- Table for collection: titans.monitoring_record_alerts
DROP TABLE IF EXISTS "monitoring_record_alerts" CASCADE;
CREATE TABLE "monitoring_record_alerts" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_monitoring_record_alerts_mongo_id ON "monitoring_record_alerts" (mongo_id);
CREATE INDEX idx_monitoring_record_alerts_data ON "monitoring_record_alerts" USING gin (data);

-- Table for collection: titans.monitoring_peps
DROP TABLE IF EXISTS "monitoring_peps" CASCADE;
CREATE TABLE "monitoring_peps" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_monitoring_peps_mongo_id ON "monitoring_peps" (mongo_id);
CREATE INDEX idx_monitoring_peps_data ON "monitoring_peps" USING gin (data);

-- Table for collection: titans.curriculums
DROP TABLE IF EXISTS "curriculums" CASCADE;
CREATE TABLE "curriculums" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_curriculums_mongo_id ON "curriculums" (mongo_id);
CREATE INDEX idx_curriculums_data ON "curriculums" USING gin (data);

-- Table for collection: titans.consultations
DROP TABLE IF EXISTS "consultations" CASCADE;
CREATE TABLE "consultations" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_consultations_mongo_id ON "consultations" (mongo_id);
CREATE INDEX idx_consultations_data ON "consultations" USING gin (data);

-- Table for collection: titans.course_progress_records
DROP TABLE IF EXISTS "course_progress_records" CASCADE;
CREATE TABLE "course_progress_records" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_course_progress_records_mongo_id ON "course_progress_records" (mongo_id);
CREATE INDEX idx_course_progress_records_data ON "course_progress_records" USING gin (data);

-- Table for collection: titans.teacherprofiles
DROP TABLE IF EXISTS "teacherprofiles" CASCADE;
CREATE TABLE "teacherprofiles" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  email TEXT,
  username TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_teacherprofiles_mongo_id ON "teacherprofiles" (mongo_id);
CREATE INDEX idx_teacherprofiles_data ON "teacherprofiles" USING gin (data);

-- Table for collection: titans.monitoring_financial_crimes
DROP TABLE IF EXISTS "monitoring_financial_crimes" CASCADE;
CREATE TABLE "monitoring_financial_crimes" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_monitoring_financial_crimes_mongo_id ON "monitoring_financial_crimes" (mongo_id);
CREATE INDEX idx_monitoring_financial_crimes_data ON "monitoring_financial_crimes" USING gin (data);

-- Table for collection: titans.unverified_teachers
DROP TABLE IF EXISTS "unverified_teachers" CASCADE;
CREATE TABLE "unverified_teachers" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_unverified_teachers_mongo_id ON "unverified_teachers" (mongo_id);
CREATE INDEX idx_unverified_teachers_data ON "unverified_teachers" USING gin (data);

-- Table for collection: titans.monitoring_alerts
DROP TABLE IF EXISTS "monitoring_alerts" CASCADE;
CREATE TABLE "monitoring_alerts" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  status TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_monitoring_alerts_mongo_id ON "monitoring_alerts" (mongo_id);
CREATE INDEX idx_monitoring_alerts_data ON "monitoring_alerts" USING gin (data);

-- Table for collection: titans.failed_payments
DROP TABLE IF EXISTS "failed_payments" CASCADE;
CREATE TABLE "failed_payments" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_failed_payments_mongo_id ON "failed_payments" (mongo_id);
CREATE INDEX idx_failed_payments_data ON "failed_payments" USING gin (data);

-- Table for collection: titans.jobs
DROP TABLE IF EXISTS "jobs" CASCADE;
CREATE TABLE "jobs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  title TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_jobs_mongo_id ON "jobs" (mongo_id);
CREATE INDEX idx_jobs_data ON "jobs" USING gin (data);

-- Table for collection: titans.requiredmaterials
DROP TABLE IF EXISTS "requiredmaterials" CASCADE;
CREATE TABLE "requiredmaterials" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_requiredmaterials_mongo_id ON "requiredmaterials" (mongo_id);
CREATE INDEX idx_requiredmaterials_data ON "requiredmaterials" USING gin (data);

-- Table for collection: titans.course_includes
DROP TABLE IF EXISTS "course_includes" CASCADE;
CREATE TABLE "course_includes" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_course_includes_mongo_id ON "course_includes" (mongo_id);
CREATE INDEX idx_course_includes_data ON "course_includes" USING gin (data);

-- Table for collection: titans.monitoring_escalates
DROP TABLE IF EXISTS "monitoring_escalates" CASCADE;
CREATE TABLE "monitoring_escalates" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_monitoring_escalates_mongo_id ON "monitoring_escalates" (mongo_id);
CREATE INDEX idx_monitoring_escalates_data ON "monitoring_escalates" USING gin (data);

-- Table for collection: titans.monitoring_investigates
DROP TABLE IF EXISTS "monitoring_investigates" CASCADE;
CREATE TABLE "monitoring_investigates" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_monitoring_investigates_mongo_id ON "monitoring_investigates" (mongo_id);
CREATE INDEX idx_monitoring_investigates_data ON "monitoring_investigates" USING gin (data);

-- Table for collection: titans.events
DROP TABLE IF EXISTS "events" CASCADE;
CREATE TABLE "events" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_events_mongo_id ON "events" (mongo_id);
CREATE INDEX idx_events_data ON "events" USING gin (data);

-- Table for collection: titans.videos
DROP TABLE IF EXISTS "videos" CASCADE;
CREATE TABLE "videos" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_videos_mongo_id ON "videos" (mongo_id);
CREATE INDEX idx_videos_data ON "videos" USING gin (data);

-- Table for collection: titans.receipts
DROP TABLE IF EXISTS "receipts" CASCADE;
CREATE TABLE "receipts" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_receipts_mongo_id ON "receipts" (mongo_id);
CREATE INDEX idx_receipts_data ON "receipts" USING gin (data);

-- Table for collection: titan_jobs.agendaJobs
DROP TABLE IF EXISTS "agendajobs" CASCADE;
CREATE TABLE "agendajobs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mongo_id TEXT UNIQUE,
  data JSONB,
  name TEXT,
  type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_agendajobs_mongo_id ON "agendajobs" (mongo_id);
CREATE INDEX idx_agendajobs_data ON "agendajobs" USING gin (data);

