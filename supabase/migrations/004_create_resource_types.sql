-- 创建资源类型表
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

-- 启用 RLS
ALTER TABLE resource_types ENABLE ROW LEVEL SECURITY;

-- 创建策略 - 所有人可读
CREATE POLICY "Resource types are viewable by everyone" ON resource_types FOR SELECT USING (true);

-- 创建策略 - 只有认证用户可写
CREATE POLICY "Authenticated users can manage resource types" ON resource_types FOR ALL USING (auth.role() = 'authenticated');

-- 插入默认资源类型数据
INSERT INTO resource_types (name, slug, icon, description, is_default, sort_order) VALUES
  ('Agent', 'agent', '🤖', '智能代理，可自主执行复杂任务', true, 1),
  ('Skill', 'skill', '⚡', '技能模块，提供特定功能能力', true, 2),
  ('Prompt', 'prompt', '💬', '提示词模板，用于 AI 对话', true, 3),
  ('Workflow', 'workflow', '🔄', '工作流程，多步骤自动化任务', true, 4)
ON CONFLICT (slug) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_resource_types_sort_order ON resource_types(sort_order);
CREATE INDEX IF NOT EXISTS idx_resource_types_slug ON resource_types(slug);
