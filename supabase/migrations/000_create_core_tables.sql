-- =============================================
-- Core Tables Migration
-- 创建核心业务表
-- =============================================

-- =============================================
-- 1. 资源表
-- =============================================
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

-- =============================================
-- 2. 标签表
-- =============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. 资源-标签关联表
-- =============================================
CREATE TABLE IF NOT EXISTS resource_tags (
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- =============================================
-- 4. 平台版本表
-- =============================================
CREATE TABLE IF NOT EXISTS variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 5. 事件记录表
-- =============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. 启用行级安全策略（RLS）
-- =============================================
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 7. 创建访问策略（允许所有操作）
-- =============================================
CREATE POLICY "Allow all operations on resources" ON resources FOR ALL USING (true);
CREATE POLICY "Allow all operations on tags" ON tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on resource_tags" ON resource_tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on variants" ON variants FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true);

-- =============================================
-- 8. 创建索引（提高查询速度）
-- =============================================
CREATE INDEX IF NOT EXISTS idx_resources_title ON resources(title);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_status ON resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_slug ON resources(slug);
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_variants_resource_id ON variants(resource_id);
CREATE INDEX IF NOT EXISTS idx_variants_platform ON variants(platform);
CREATE INDEX IF NOT EXISTS idx_events_resource_id ON events(resource_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
