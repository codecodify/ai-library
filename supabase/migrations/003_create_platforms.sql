-- 创建平台表
CREATE TABLE IF NOT EXISTS platforms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;

-- 创建策略 - 所有人可读
CREATE POLICY "Platforms are viewable by everyone" ON platforms FOR SELECT USING (true);

-- 创建策略 - 只有认证用户可写
CREATE POLICY "Authenticated users can manage platforms" ON platforms FOR ALL USING (auth.role() = 'authenticated');

-- 插入默认平台数据
INSERT INTO platforms (name, slug, icon, is_default, sort_order) VALUES
  ('ChatGPT', 'chatgpt', '🤖', true, 1),
  ('Cursor', 'cursor', '⚡', true, 2),
  ('Claude', 'claude', '🧠', true, 3),
  ('Dify', 'dify', '🔧', true, 4),
  ('Coze', 'coze', '🎯', true, 5),
  ('Notion', 'notion', '📝', true, 6),
  ('通用', 'generic', '📦', true, 7)
ON CONFLICT (slug) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_platforms_sort_order ON platforms(sort_order);
CREATE INDEX IF NOT EXISTS idx_platforms_slug ON platforms(slug);
