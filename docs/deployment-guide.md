# AI Agent / Skills Library - 部署指南

> 本文档面向初次使用 Next.js、Supabase 和 Vercel 的开发者，详细说明如何从零开始部署项目。

---

## 一、技术栈简介

在开始之前，先简单了解这三个技术：

| 技术 | 用途 | 类比 |
|------|------|------|
| **Next.js** | 前端框架，构建网站页面 | 就像房子的主体结构 |
| **Supabase** | 后端服务，提供数据库和认证 | 就像房子的地基和物业系统 |
| **Vercel** | 部署平台，托管网站 | 就像房子的房地产开发商 |

### 工作原理

```
用户访问网站 → Vercel 托管的 Next.js 处理请求
                ↓
         调用 Supabase 获取数据/验证用户
                ↓
         返回网页给用户
```

---

## 二、环境准备

### 2.1 安装 Node.js

Node.js 是运行 JavaScript 的环境，Next.js 需要它。

**Windows 用户：**
1. 访问 https://nodejs.org/
2. 下载 LTS（长期支持）版本
3. 运行安装程序，全程点"下一步"

**Mac 用户：**
```bash
# 使用 Homebrew 安装（推荐）
brew install node

# 或者下载安装包：https://nodejs.org/
```

**验证安装：**
```bash
node --version   # 应该显示 v18 或更高版本
npm --version    # 应该显示 v9 或更高版本
```

### 2.2 安装 Git

Git 是版本控制工具，用于管理代码。

**Windows 用户：**
1. 访问 https://git-scm.com/
2. 下载 Windows 版本
3. 安装时选择"Use Git from the Windows Command Prompt"

**Mac 用户：**
```bash
# 通常已预装，如果没有：
brew install git
```

**验证安装：**
```bash
git --version
```

### 2.3 安装代码编辑器

推荐使用 **Visual Studio Code** (VS Code)：
1. 访问 https://code.visualstudio.com/
2. 下载并安装

安装完成后，打开 VS Code，按 `Ctrl+Shift+P`（Mac 是 `Cmd+Shift+P`），输入 "Shell Command: Install 'code' command in PATH"，回车。

---

## 三、获取项目代码

### 3.1 克隆项目

如果代码已经在 GitHub 上：

```bash
# 打开终端，进入你存放项目的目录
cd ~/Projects

# 克隆代码（替换为你的仓库地址）
git clone https://github.com/你的用户名/ai-library.git

# 进入项目目录
cd ai-library
```

### 3.2 安装依赖

项目需要安装各种代码库（就像装修材料）：

```bash
# 在项目目录下运行
npm install
```

这会读取 `package.json` 文件并安装所有需要的包，可能需要几分钟。

---

## 四、Supabase 配置

Supabase 是项目的"后端"，提供数据库和用户认证。

### 4.1 创建 Supabase 账号

1. 访问 https://supabase.com/
2. 点击 "Start your project"
3. 使用 GitHub 账号登录（推荐）或邮箱注册
4. 点击 "New Project"

### 4.2 创建项目

填写项目信息：

| 字段 | 填写建议 |
|------|----------|
| **Name** | `ai-agent-library` |
| **Database Password** | 设置一个强密码，**务必记住**，后面会用到 |
| **Region** | 选择离你最近的（如 `Northeast Asia` 或 `Singapore`） |
| **Pricing Plan** | Free（免费，足够开发使用） |

点击 "Create new project"，等待 1-2 分钟创建完成。

### 4.3 创建数据库表

项目需要 5 张表来存储数据。在 Supabase 控制台：

1. 点击左侧菜单 **SQL Editor**
2. 在输入框中粘贴以下 SQL 语句
3. 点击 **Run**

```sql
-- =============================================
-- 1. 创建资源表（核心表）
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
-- 2. 创建标签表
-- =============================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. 创建资源-标签关联表
-- =============================================
CREATE TABLE IF NOT EXISTS resource_tags (
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- =============================================
-- 4. 创建平台版本表
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
-- 5. 创建事件记录表
-- =============================================
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. 创建用户设置表
-- =============================================
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
-- 7. 创建平台表
-- =============================================
CREATE TABLE IF NOT EXISTS platforms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 8. 创建资源类型表
-- =============================================
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
-- 9. 启用行级安全策略（RLS）
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
-- 10. 创建访问策略
-- =============================================
CREATE POLICY "Allow all operations on resources" ON resources FOR ALL USING (true);
CREATE POLICY "Allow all operations on tags" ON tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on resource_tags" ON resource_tags FOR ALL USING (true);
CREATE POLICY "Allow all operations on variants" ON variants FOR ALL USING (true);
CREATE POLICY "Allow all operations on events" ON events FOR ALL USING (true);
CREATE POLICY "Users can manage own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Platforms are viewable by everyone" ON platforms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage platforms" ON platforms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Resource types are viewable by everyone" ON resource_types FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage resource types" ON resource_types FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- 11. 创建索引（提高查询速度）
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
CREATE INDEX IF NOT EXISTS idx_platforms_sort_order ON platforms(sort_order);
CREATE INDEX IF NOT EXISTS idx_platforms_slug ON platforms(slug);
CREATE INDEX IF NOT EXISTS idx_resource_types_sort_order ON resource_types(sort_order);
CREATE INDEX IF NOT EXISTS idx_resource_types_slug ON resource_types(slug);

-- =============================================
-- 12. 插入默认平台数据
-- =============================================
INSERT INTO platforms (name, slug, icon, is_default, sort_order) VALUES
  ('ChatGPT', 'chatgpt', '🤖', true, 1),
  ('Cursor', 'cursor', '⚡', true, 2),
  ('Claude', 'claude', '🧠', true, 3),
  ('Dify', 'dify', '🔧', true, 4),
  ('Coze', 'coze', '🎯', true, 5),
  ('Notion', 'notion', '📝', true, 6),
  ('通用', 'generic', '📦', true, 7)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- 13. 插入默认资源类型数据
-- =============================================
INSERT INTO resource_types (name, slug, icon, description, is_default, sort_order) VALUES
  ('Agent', 'agent', '🤖', '智能代理，可自主执行复杂任务', true, 1),
  ('Skill', 'skill', '⚡', '技能模块，提供特定功能能力', true, 2),
  ('Prompt', 'prompt', '💬', '提示词模板，用于 AI 对话', true, 3),
  ('Workflow', 'workflow', '🔄', '工作流程，多步骤自动化任务', true, 4)
ON CONFLICT (slug) DO NOTHING;
```

看到 "Success! No rows returned" 即表示执行成功。

### 4.4 获取 API 密钥

1. 点击左侧菜单 **Project Settings**（齿轮图标）
2. 点击 **API**
3. 找到 **Project URL** 和 **anon public** 密钥，复制保存

---

## 五、本地开发配置

### 5.1 配置环境变量

1. 在项目根目录创建 `.env.local` 文件：

```bash
# Windows 用户可以在 VS Code 中新建文件
# Mac/Linux 用户：
touch .env.local
```

2. 写入以下内容（替换为你的实际值）：

```bash
# 必填：Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥

# 可选：AI 服务（如果你想用 AI 功能）
# OPENAI_API_KEY=sk-你的OpenAI密钥
# ANTHROPIC_API_KEY=sk-ant-你的Claude密钥
```

**如何获取这些值：**
- `NEXT_PUBLIC_SUPABASE_URL` - 见 4.4 节，格式是 `https://xxxxx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 见 4.4 节，一长串字符

### 5.2 启动开发服务器

```bash
npm run dev
```

看到类似下面的输出表示启动成功：
```
▲ Next.js 16.1.6
- Local: http://localhost:3000
- Network: http://192.168.1.x:3000
```

打开浏览器访问 http://localhost:3000 应该能看到网站！

### 5.3 停止开发服务器

在终端按 `Ctrl+C`（Mac 是 `Cmd+C`）停止。

---

## 六、Vercel 部署

Vercel 是 Next.js 的官方托管平台，可以免费部署。

### 6.1 注册 Vercel 账号

1. 访问 https://vercel.com/
2. 点击 "Sign Up"
3. 选择 "Continue with GitHub"（推荐）

### 6.2 连接 GitHub

1. 登录后，点击 "Add New..." → "Project"
2. 找到你的 GitHub 仓库，点击 "Import"

### 6.3 配置环境变量

在 Vercel 部署页面：

1. 找到 **Environment Variables** 部分
2. 逐一添加以下变量：

| 变量名 | 值 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 Supabase anon 密钥 |

3. 点击 **Deploy**

等待 2-3 分钟，部署完成！

### 6.4 配置认证回调

部署完成后：

1. 打开你的 Supabase 控制台
2. 进入 **Authentication** → **URL Configuration**
3. 在 **Site URL** 中填入你的 Vercel 域名（格式：`https://你的项目.vercel.app`）
4. 在 **Redirect URLs** 中添加：
   - `http://localhost:3000/auth/v1/callback`
   - `https://你的项目.vercel.app/auth/v1/callback`

---

## 七、验证部署

### 7.1 测试基本功能

1. 打开 Vercel 提供的链接
2. 点击"新增资源"，创建一个测试资源
3. 在列表页查看是否显示
4. 点击资源，查看详情

### 7.2 测试搜索和筛选

1. 在搜索框输入关键词
2. 点击不同类型筛选
3. 测试平台筛选

### 7.3 测试登录注册

1. 点击"注册"，输入邮箱和密码
2. 查看邮箱，点击确认链接
3. 登录后测试功能

---

## 八、常见问题排查

### 问题 1：页面显示空白

**检查：**
1. 打开浏览器开发者工具（F12），查看 Console 是否有红色错误
2. 确认 `.env.local` 文件中的变量是否正确
3. 确认 Supabase 项目是否正常运行

### 问题 2：登录/注册失败

**检查：**
1. 确认 Supabase 的 Authentication 设置中 Email 认证已启用
2. 确认 Redirect URLs 包含你的域名
3. 查看 Supabase 的 Logs 看具体错误

### 问题 3：数据库操作失败

**检查：**
1. 确认 RLS 策略已创建（见 4.3 节）
2. 确认表名和字段名正确
3. 查看 Supabase 的 Logs

### 问题 4：部署后样式错乱

**检查：**
1. 确认 Tailwind CSS 正确安装
2. 清除浏览器缓存后刷新
3. 在 Vercel 重新部署

---

## 九、日常开发流程

### 9.1 修改代码后测试

```bash
# 1. 确保在项目目录
cd ai-library

# 2. 拉取最新代码
git pull

# 3. 安装新依赖（如果有）
npm install

# 4. 启动开发服务器
npm run dev
```

### 9.2 提交代码更新

```bash
# 1. 查看修改的文件
git status

# 2. 添加要提交的文件
git add .

# 3. 提交修改
git commit -m "描述你的修改"

# 4. 推送到 GitHub
git push
```

推送到 GitHub 后，Vercel 会自动检测并重新部署。

---

## 十、附录：常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 运行生产版本 |
| `npm run lint` | 检查代码问题 |
| `Ctrl+C` | 停止运行 |

---

## 十一、进一步学习资源

### Next.js
- 官方文档：https://nextjs.org/docs
- 中文文档：https://nextjs.org.cn

### Supabase
- 官方文档：https://supabase.com/docs
- 中文指南：https://supabase.com/docs/guides

### Vercel
- 官方文档：https://vercel.com/docs

---

祝部署顺利！如有疑问请随时提问。
