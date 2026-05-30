-- Create CEFR Levels Table
CREATE TABLE IF NOT EXISTS levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_code VARCHAR(3) NOT NULL UNIQUE,
  level_name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Stories Table
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_id UUID NOT NULL REFERENCES levels(id),
  title VARCHAR(255) NOT NULL,
  english_text TEXT NOT NULL,
  turkish_text TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  estimated_time_minutes INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create User Profiles Table
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  preferred_language VARCHAR(10) DEFAULT 'en',
  dark_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create User Progress Table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id),
  level_id UUID NOT NULL REFERENCES levels(id),
  wpm DECIMAL(5,2),
  accuracy DECIMAL(5,2),
  time_spent_seconds INTEGER,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, story_id)
);

-- Create User Mistakes Table
CREATE TABLE IF NOT EXISTS user_mistakes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES stories(id),
  word_position INTEGER,
  english_word VARCHAR(255),
  typed_word VARCHAR(255),
  mistake_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stories_level_id ON stories(level_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_story_id ON user_progress(story_id);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_user_id ON user_mistakes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_mistakes_story_id ON user_mistakes(story_id);

-- Insert CEFR Levels
INSERT INTO levels (level_code, level_name, description, order_index) VALUES
  ('A1', 'Beginner', 'Elementary proficiency - Simple daily expressions', 1),
  ('A2', 'Elementary', 'Limited working proficiency - Common topics', 2),
  ('B1', 'Intermediate', 'Threshold proficiency - Main ideas understood', 3),
  ('B2', 'Upper Intermediate', 'Vantage level - Fluent conversation', 4),
  ('C1', 'Advanced', 'Effective operational proficiency - Complex texts', 5),
  ('C2', 'Mastery', 'Full proficiency - Nuanced understanding', 6)
ON CONFLICT (level_code) DO NOTHING;

-- Enable RLS
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mistakes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for levels (public read-only)
CREATE POLICY "Levels are viewable by everyone" 
  ON levels FOR SELECT 
  USING (true);

-- RLS Policies for stories (public read-only)
CREATE POLICY "Stories are viewable by everyone" 
  ON stories FOR SELECT 
  USING (true);

-- RLS Policies for users_profile
CREATE POLICY "Users can view their own profile" 
  ON users_profile FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON users_profile FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON users_profile FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for user_progress
CREATE POLICY "Users can view their own progress" 
  ON user_progress FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" 
  ON user_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
  ON user_progress FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for user_mistakes
CREATE POLICY "Users can view their own mistakes" 
  ON user_mistakes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mistakes" 
  ON user_mistakes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create a view for user statistics
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  up.user_id,
  COUNT(DISTINCT up.story_id) as completed_stories,
  ROUND(AVG(up.accuracy)::numeric, 2) as avg_accuracy,
  ROUND(AVG(up.wpm)::numeric, 2) as avg_wpm,
  MAX(up.completed_at) as last_completed_at
FROM user_progress up
WHERE up.completed_at IS NOT NULL
GROUP BY up.user_id;

-- Create policy for the view
CREATE POLICY "Users can view their own stats" 
  ON user_stats FOR SELECT 
  USING (auth.uid() = user_id);
