-- ============================================================
-- Career Crafter — PostgreSQL Schema
-- ============================================================
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('student', 'counsellor', 'college', 'parent');
CREATE TYPE skill_category AS ENUM ('technical', 'soft', 'language', 'tool');
CREATE TYPE goal_category AS ENUM ('learning', 'project', 'job', 'certification', 'networking', 'other');
CREATE TYPE goal_priority AS ENUM ('high', 'medium', 'low');
CREATE TYPE assessment_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE assessment_section AS ENUM ('interests', 'intelligences', 'workstyle', 'skills');
CREATE TYPE roadmap_skill_type AS ENUM ('required_skill', 'certification', 'course');
CREATE TYPE counsellor_student_status AS ENUM ('active', 'pending', 'inactive');
CREATE TYPE note_session_type AS ENUM ('guidance', 'assessment', 'career', 'skills', 'followup');
CREATE TYPE announcement_category AS ENUM ('placement', 'workshop', 'deadline', 'general');
CREATE TYPE chat_role AS ENUM ('user', 'assistant');

-- ============================================================
-- AUTHENTICATION
-- ============================================================
CREATE TABLE users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               VARCHAR(255) NOT NULL UNIQUE,
  password_hash       VARCHAR(255) NOT NULL,
  role                user_role NOT NULL,
  name                VARCHAR(255),
  is_verified         BOOLEAN NOT NULL DEFAULT FALSE,
  verification_token  VARCHAR(255),
  reset_token         VARCHAR(255),
  reset_token_expires TIMESTAMP,
  created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login          TIMESTAMP,
  CONSTRAINT email_format CHECK (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

CREATE TABLE sessions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(512) NOT NULL UNIQUE,
  expires_at  TIMESTAMP NOT NULL,
  device_info VARCHAR(255),
  ip_address  VARCHAR(45),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ============================================================
-- STUDENT TABLES
-- ============================================================
CREATE TABLE student_profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  first_name       VARCHAR(100),
  last_name        VARCHAR(100),
  phone            VARCHAR(20),
  city             VARCHAR(100),
  state            VARCHAR(100),
  date_of_birth    DATE,
  gender           VARCHAR(30),
  tagline          TEXT,
  linkedin_url     VARCHAR(255),
  github_url       VARCHAR(255),
  degree           VARCHAR(100),
  institution      VARCHAR(255),
  branch           VARCHAR(100),
  graduation_year  INT CHECK (graduation_year BETWEEN 2000 AND 2040),
  cgpa             VARCHAR(20),
  target_field     VARCHAR(100),
  work_preference  VARCHAR(100),
  work_mode        VARCHAR(50),
  expected_salary  VARCHAR(50),
  experience       VARCHAR(50),
  streak           INT NOT NULL DEFAULT 0 CHECK (streak >= 0),
  last_visit       DATE,
  profile_photo    VARCHAR(500),
  updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE student_skills (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  skill_name  VARCHAR(100) NOT NULL,
  category    skill_category NOT NULL DEFAULT 'technical',
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, skill_name)
);

CREATE TABLE student_goals (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  category    goal_category NOT NULL DEFAULT 'learning',
  priority    goal_priority NOT NULL DEFAULT 'medium',
  deadline    DATE,
  is_done     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE student_certifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  issuer          VARCHAR(255),
  issued_date     VARCHAR(20),
  certificate_url VARCHAR(500),
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE student_activity_log (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_date  DATE NOT NULL,
  activity_count INT NOT NULL DEFAULT 1 CHECK (activity_count > 0),
  UNIQUE (user_id, activity_date)
);

CREATE INDEX idx_student_skills_user ON student_skills(user_id);
CREATE INDEX idx_student_goals_user ON student_goals(user_id);
CREATE INDEX idx_activity_user_date ON student_activity_log(user_id, activity_date);

-- ============================================================
-- ASSESSMENT TABLES
-- ============================================================
CREATE TABLE assessment_attempts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       assessment_status NOT NULL DEFAULT 'in_progress',
  started_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  CONSTRAINT completed_requires_timestamp CHECK (
    status != 'completed' OR completed_at IS NOT NULL
  )
);

CREATE TABLE assessment_answers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id     UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  section        assessment_section NOT NULL,
  question_index INT NOT NULL CHECK (question_index >= 0),
  trait_key      VARCHAR(50) NOT NULL,
  answer_value   VARCHAR(100) NOT NULL,
  answered_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, section, question_index)
);

CREATE TABLE assessment_results (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attempt_id        UUID NOT NULL UNIQUE REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  riasec_r          INT NOT NULL DEFAULT 0 CHECK (riasec_r BETWEEN 0 AND 100),
  riasec_i          INT NOT NULL DEFAULT 0 CHECK (riasec_i BETWEEN 0 AND 100),
  riasec_a          INT NOT NULL DEFAULT 0 CHECK (riasec_a BETWEEN 0 AND 100),
  riasec_s          INT NOT NULL DEFAULT 0 CHECK (riasec_s BETWEEN 0 AND 100),
  riasec_e          INT NOT NULL DEFAULT 0 CHECK (riasec_e BETWEEN 0 AND 100),
  riasec_c          INT NOT NULL DEFAULT 0 CHECK (riasec_c BETWEEN 0 AND 100),
  mi_logical        INT NOT NULL DEFAULT 0 CHECK (mi_logical BETWEEN 0 AND 100),
  mi_spatial        INT NOT NULL DEFAULT 0 CHECK (mi_spatial BETWEEN 0 AND 100),
  mi_linguistic     INT NOT NULL DEFAULT 0 CHECK (mi_linguistic BETWEEN 0 AND 100),
  mi_kinesthetic    INT NOT NULL DEFAULT 0 CHECK (mi_kinesthetic BETWEEN 0 AND 100),
  mi_interpersonal  INT NOT NULL DEFAULT 0 CHECK (mi_interpersonal BETWEEN 0 AND 100),
  mi_intrapersonal  INT NOT NULL DEFAULT 0 CHECK (mi_intrapersonal BETWEEN 0 AND 100),
  skills_json       JSONB,
  top_career_1      VARCHAR(100),
  top_career_2      VARCHAR(100),
  top_career_3      VARCHAR(100),
  match_scores_json JSONB,
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_assessment_attempts_user ON assessment_attempts(user_id);
CREATE INDEX idx_assessment_answers_attempt ON assessment_answers(attempt_id);
CREATE INDEX idx_assessment_results_user ON assessment_results(user_id);

-- ============================================================
-- CAREER ROADMAP TABLES
-- ============================================================
CREATE TABLE career_roadmaps (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  career_key   VARCHAR(50) NOT NULL UNIQUE,
  title        VARCHAR(100) NOT NULL,
  description  TEXT,
  gradient     VARCHAR(200),
  level        VARCHAR(50),
  duration     VARCHAR(50),
  salary_range VARCHAR(50),
  salary_pct   INT CHECK (salary_pct BETWEEN 0 AND 100),
  created_at   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE roadmap_steps (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id  UUID NOT NULL REFERENCES career_roadmaps(id) ON DELETE CASCADE,
  step_number INT NOT NULL CHECK (step_number > 0),
  title       VARCHAR(100) NOT NULL,
  duration    VARCHAR(50),
  color       VARCHAR(20),
  chips_json  JSONB,
  UNIQUE (roadmap_id, step_number)
);

CREATE TABLE roadmap_skills (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id  UUID NOT NULL REFERENCES career_roadmaps(id) ON DELETE CASCADE,
  skill_name  VARCHAR(100) NOT NULL,
  type        roadmap_skill_type NOT NULL DEFAULT 'required_skill',
  order_index INT NOT NULL DEFAULT 0
);

CREATE TABLE user_roadmap_progress (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  roadmap_id   UUID NOT NULL REFERENCES career_roadmaps(id) ON DELETE CASCADE,
  current_step INT NOT NULL DEFAULT 0 CHECK (current_step >= 0),
  progress_pct INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  started_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, roadmap_id)
);

CREATE INDEX idx_roadmap_steps_roadmap ON roadmap_steps(roadmap_id);
CREATE INDEX idx_roadmap_skills_roadmap ON roadmap_skills(roadmap_id);
CREATE INDEX idx_user_roadmap_progress_user ON user_roadmap_progress(user_id);

-- ============================================================
-- COUNSELLOR TABLES
-- ============================================================
CREATE TABLE counsellor_profiles (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  organisation   VARCHAR(255),
  experience     VARCHAR(50),
  specialisation VARCHAR(100),
  phone          VARCHAR(20)
);

CREATE TABLE counsellor_students (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  counsellor_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_name   VARCHAR(255) NOT NULL,
  student_email  VARCHAR(255) NOT NULL,
  education      VARCHAR(100),
  target_career  VARCHAR(100),
  status         counsellor_student_status NOT NULL DEFAULT 'active',
  progress_pct   INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  added_at       TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (counsellor_id, student_email)
);

CREATE TABLE counsellor_notes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  counsellor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES counsellor_students(id) ON DELETE CASCADE,
  session_type  note_session_type NOT NULL DEFAULT 'guidance',
  note_text     TEXT NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_counsellor_students_counsellor ON counsellor_students(counsellor_id);
CREATE INDEX idx_counsellor_notes_student ON counsellor_notes(student_id);

-- ============================================================
-- COLLEGE TABLES
-- ============================================================
CREATE TABLE college_profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  institution_name VARCHAR(255) NOT NULL,
  city             VARCHAR(100),
  state            VARCHAR(100),
  inst_type        VARCHAR(100),
  student_count    VARCHAR(50),
  contact_name     VARCHAR(255),
  designation      VARCHAR(100),
  phone            VARCHAR(20),
  website          VARCHAR(255)
);

CREATE TABLE college_departments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          VARCHAR(255) NOT NULL,
  hod           VARCHAR(255),
  student_count INT CHECK (student_count >= 0),
  career_focus  VARCHAR(100),
  progress_pct  INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE college_announcements (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  college_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      VARCHAR(255) NOT NULL,
  category   announcement_category NOT NULL DEFAULT 'general',
  body_text  TEXT,
  event_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_college_departments_college ON college_departments(college_id);
CREATE INDEX idx_college_announcements_college ON college_announcements(college_id);

-- ============================================================
-- PARENT TABLES
-- ============================================================
CREATE TABLE parent_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  phone           VARCHAR(20),
  child_name      VARCHAR(255),
  child_education VARCHAR(100),
  relationship    VARCHAR(50),
  linked_child_id UUID REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT no_self_link CHECK (user_id != linked_child_id)
);

-- ============================================================
-- CHATBOT
-- ============================================================
CREATE TABLE chat_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        chat_role NOT NULL,
  message     TEXT NOT NULL,
  tokens_used INT CHECK (tokens_used >= 0),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_history_user ON chat_history(user_id);
CREATE INDEX idx_chat_history_created ON chat_history(user_id, created_at DESC);

-- ============================================================
-- SEED: Career Roadmaps
-- ============================================================
INSERT INTO career_roadmaps (career_key, title, level, duration, salary_range, salary_pct) VALUES
  ('ai-engineer',      'AI Engineer',             'Intermediate', '12-18 months', '₹8L – ₹35L/yr',  85),
  ('web-dev',          'Web Developer',            'Beginner',     '6-12 months',  '₹4L – ₹25L/yr',  60),
  ('game-dev',         'Game Developer',           'Intermediate', '12-18 months', '₹4L – ₹20L/yr',  50),
  ('cybersecurity',    'Cybersecurity Analyst',    'Intermediate', '12-18 months', '₹5L – ₹28L/yr',  70),
  ('data-scientist',   'Data Analyst / Scientist', 'Intermediate', '9-15 months',  '₹5L – ₹30L/yr',  75),
  ('mobile-dev',       'Mobile App Developer',     'Beginner',     '6-12 months',  '₹4L – ₹22L/yr',  55),
  ('cloud-engineer',   'Cloud Engineer',           'Advanced',     '18-24 months', '₹7L – ₹40L/yr',  90),
  ('devops-engineer',  'DevOps Engineer',          'Advanced',     '18-24 months', '₹8L – ₹38L/yr',  88),
  ('ux-designer',      'UX / UI Designer',         'Beginner',     '6-9 months',   '₹3.5L – ₹20L/yr',48),
  ('blockchain-dev',   'Blockchain Developer',     'Advanced',     '18-24 months', '₹8L – ₹45L/yr',  95);
