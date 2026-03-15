-- 创建用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  default_sort TEXT DEFAULT 'updated_at',
  default_platform TEXT,
  openai_api_key TEXT,
  anthropic_api_key TEXT,
  openrouter_api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 启用 RLS
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
