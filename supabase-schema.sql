-- =============================================
-- AI Agent / Skills Library
-- Supabase 数据库完整架构
-- =============================================
-- 使用说明：
-- 1. 在 Supabase 控制台打开 SQL Editor
-- 2. 复制此文件全部内容并粘贴
-- 3. 点击 Run 执行
-- =============================================

-- =============================================
-- 第一部分：核心业务表
-- =============================================

-- 1.1 资源表
-- 存储所有 AI Agent、Skill、Prompt、Workflow
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'agent',
  summary TEXT,
  description TEXT,
  content TEXT,
  source_url TEXT,
  status TEXT DEFAULT 'published',
  is_favorite BOOLEAN DEFAULT false,
  is_frequent BOOLEAN DEFAULT false,
  copy_count INTEGER DEFAULT 0,
  last_copied_at TIMESTAMP WITH TIME ZONE,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 标签表
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 资源-标签关联表
CREATE TABLE IF NOT EXISTS resource_tags (
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- 1.4 平台版本表
-- 存储不同平台的资源变体
CREATE TABLE IF NOT EXISTS variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.5 事件记录表
-- 记录查看、复制等事件
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 第二部分：用户设置表
-- =============================================

-- 2.1 用户设置表
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  default_sort TEXT DEFAULT 'updated_at',
  default_platform TEXT,
  openai_api_key TEXT,
  anthropic_api_key TEXT,
  openrouter_api_key TEXT,
  api_base_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =============================================
-- 第三部分：配置表
-- =============================================

-- 3.1 平台表
CREATE TABLE IF NOT EXISTS platforms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 资源类型表
CREATE TABLE IF NOT EXISTS resource_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 第四部分：行级安全策略（RLS）
-- =============================================

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_types ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 第五部分：访问策略
-- =============================================

-- 5.1 核心表策略（允许所有操作）
CREATE POLICY "Allow all operations on resources" ON resources FOR ALL USING (true);
CREATE POLICY "Allow all operations on tags" ON tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on resource_tags" ON resource_tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on variants" ON variants FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true);

-- 5.2 用户设置策略（仅本人可管理）
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- 5.3 平台表策略（所有人可读，认证用户可写）
CREATE POLICY "Platforms are viewable by everyone" ON platforms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage platforms" ON platforms FOR ALL USING (auth.role() = 'authenticated');

-- 5.4 资源类型表策略（所有人可读，认证用户可写）
CREATE POLICY "Resource types are viewable by everyone" ON resource_types FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage resource types" ON resource_types FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- 第六部分：索引
-- =============================================

-- 6.1 资源表索引
CREATE INDEX IF NOT EXISTS idx_resources_title ON resources(title);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_slug ON resources(slug);

-- 6.2 标签表索引
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- 6.3 平台版本表索引
CREATE INDEX IF NOT EXISTS idx_variants_resource_id ON variants(resource_id);
CREATE INDEX IF NOT EXISTS idx_variants_platform ON variants(platform);

-- 6.4 事件表索引
CREATE INDEX IF NOT EXISTS idx_events_resource_id ON events(resource_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);

-- 6.5 平台表索引
CREATE INDEX IF NOT EXISTS idx_platforms_sort_order ON platforms(sort_order);
CREATE INDEX IF NOT EXISTS idx_platforms_slug ON platforms(slug);

-- 6.6 资源类型表索引
CREATE INDEX IF NOT EXISTS idx_resource_types_sort_order ON resource_types(sort_order);
CREATE INDEX IF NOT EXISTS idx_resource_types_slug ON resource_types(slug);

-- =============================================
-- 第七部分：默认数据
-- =============================================

-- 7.1 默认平台
INSERT INTO platforms (name, slug, icon, is_default, sort_order) VALUES
  ('ChatGPT', 'chatgpt', '🤖', true, 1),
  ('Cursor', 'cursor', '⚡', true, 2),
  ('Claude', 'claude', '🧠', true, 3),
  ('Dify', 'dify', '🔧', true, 4),
  ('Coze', 'coze', '🎯', true, 5),
  ('Notion', 'notion', '📝', true, 6),
  ('通用', 'generic', '📦', true, 7)
ON CONFLICT (slug) DO NOTHING;

-- 7.2 默认资源类型
INSERT INTO resource_types (name, slug, icon, description, is_default, sort_order) VALUES
  ('Agent', 'agent', '🤖', '智能代理，可自主执行复杂任务', true, 1),
  ('Skill', 'skill', '⚡', '技能模块，提供特定功能能力', true, 2),
  ('Prompt', 'prompt', '💬', '提示词模板，用于 AI 对话', true, 3),
  ('Workflow', 'workflow', '🔄', '工作流程，多步骤自动化任务', true, 4)
ON CONFLICT (slug) DO NOTHING;
