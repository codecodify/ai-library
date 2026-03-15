-- 添加 API Base URL 字段到用户设置表
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS api_base_url TEXT;
