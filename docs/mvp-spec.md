# AI Agent / Skills Library — MVP 设计文档

一个面向个人开发者的 AI Agent / Skills 资源库 Web 应用，用于统一管理、检索、预览并快速复制 AI Agents / Skills 到第三方工具（如 ChatGPT、Cursor、Dify 等）。

---

## 一、MVP 功能清单

### 1. 资源管理

**基础功能**
- 新增资源
- 编辑资源
- 删除资源
- 查看资源详情
- 标记收藏
- 标记常用

**支持资源类型**
- Agent
- Skill
- Prompt
- Workflow

**资源基础字段**
- 名称
- 简介
- 详细说明
- 主体内容
- 类型
- 适用平台
- 标签
- 来源链接
- 状态
- 更新时间

### 2. 搜索与筛选

**必做功能**
- 顶部全文搜索
- 按类型筛选
- 按平台筛选
- 按标签筛选
- 按收藏筛选
- 按最近使用排序
- 按最近更新排序

**第一版搜索范围**
- title
- summary
- description
- content
- tags

### 3. 详情预览

**必做功能**
- 查看完整内容
- 查看适用平台
- 查看标签
- 查看来源
- 查看多版本内容
- 一键复制主内容

**可选增强**
- 代码高亮
- Markdown 渲染
- JSON / YAML 格式预览切换

### 4. 平台版本管理 (Variants)

同一个资源可以有多个平台版本。

**示例**
- ChatGPT 版本
- Cursor 版本
- Dify 版本
- 通用版本

**必做功能**
- 一个资源可包含多个 Variant
- Variant 可独立编辑内容
- 详情页支持切换 Variant
- Variant 内容可一键复制

### 5. 使用行为记录

**必做记录**
- 最近复制时间
- 复制次数
- 最后查看时间

**用途**

用于实现：
- 最近使用
- 最常复制
- 高频资源推荐

### 6. 轻量 AI 增强

第一版建议只做两个功能：
- 自动生成标签
- 自动生成摘要

**触发方式**
- 新增资源时
- 编辑资源时

无需复杂 Agent。

---

## 二、数据库表结构设计

数据库使用 Supabase (PostgreSQL)。

MVP 建议 5 张核心表。

### 1. resources（资源主表）

```sql
create table resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  type text not null check (type in ('agent', 'skill', 'prompt', 'workflow')),
  summary text,
  description text,
  content text not null,
  source_url text,
  author_name text,
  status text not null default 'draft' check (status in ('draft', 'ready', 'archived')),
  is_favorite boolean not null default false,
  is_frequent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_viewed_at timestamptz,
  last_copied_at timestamptz
);
```

**字段说明**

| 字段 | 说明 |
|------|------|
| content | 主体内容 |
| description | 详细说明 |
| summary | 简短摘要 |
| slug | 用于 URL |
| status | 控制资源状态 |

### 2. resource_variants（平台版本）

```sql
create table resource_variants (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references resources(id) on delete cascade,
  platform text not null,
  format text not null check (format in ('plain', 'markdown', 'json', 'yaml')),
  title text,
  content text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**示例**

一个资源可以有：

| platform | format |
|----------|--------|
| chatgpt | markdown |
| cursor | plain |
| dify | json |

### 3. tags（标签）

```sql
create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text,
  created_at timestamptz not null default now()
);
```

### 4. resource_tags（资源标签关系）

```sql
create table resource_tags (
  resource_id uuid not null references resources(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key (resource_id, tag_id)
);
```

### 5. resource_events（行为记录）

```sql
create table resource_events (
  id uuid primary key default gen_random_uuid(),
  resource_id uuid not null references resources(id) on delete cascade,
  variant_id uuid references resource_variants(id) on delete set null,
  event_type text not null check (event_type in ('view', 'copy', 'create', 'update')),
  created_at timestamptz not null default now()
);
```

**用途**

用于统计：
- 最常复制资源
- 最近查看资源
- 平台使用情况

---

## 三、推荐补充字段

**平台枚举**

建议统一平台名称：
- chatgpt
- cursor
- claude
- dify
- coze
- notion
- generic

**来源类型**
```sql
source_type text check (source_type in ('manual','imported','generated'))
```

**用户字段（未来多用户）**
```sql
user_id uuid references auth.users(id)
```

---

## 四、全文搜索设计

第一版使用 Postgres Full Text Search。

**添加搜索列**
```sql
alter table resources
add column search_vector tsvector;
```

**初始化搜索向量**
```sql
update resources
set search_vector =
  to_tsvector('simple',
    coalesce(title, '') || ' ' ||
    coalesce(summary, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(content, '')
  );
```

**创建搜索索引**
```sql
create index idx_resources_search_vector
on resources
using gin(search_vector);
```

---

## 五、页面信息架构

建议控制在 4 个主页面 + 1 个设置页。

### 1. 首页 /

**作用**

快速访问常用资源。

**模块**
- 全局搜索框
- 最近使用
- 最近新增
- 收藏资源
- 快速筛选入口
- 最近复制记录

### 2. 资源列表页 /resources

**布局**

- **左侧筛选**
  - 类型
  - 平台
  - 标签
  - 状态
  - 收藏

- **中间列表**
  - 搜索框
  - 排序
  - 资源列表

- **右上角**
  - 新增资源按钮

**列表展示**
- 名称
- 类型
- 平台数量
- 标签
- 简介
- 更新时间
- 收藏状态
- 复制次数

### 3. 资源详情页 /resources/[slug]

**模块**
- 标题
- 类型
- 标签
- 平台
- 简介
- 详细说明
- Variant 切换 Tabs
- 内容预览
- 复制按钮
- 来源链接

**操作**
- 编辑
- 收藏
- 复制
- 打开来源

### 4. 新增 / 编辑页

**路径**：
- /resources/new
- /resources/[slug]/edit

**表单字段**
- 名称
- slug
- 类型
- 简介
- 详细说明
- 主内容
- 来源链接
- 标签
- 状态
- 收藏
- Variant

**AI 按钮**
- 自动摘要
- 自动标签
- 自动生成 Variant

### 5. 设置页 /settings

**内容**
- 默认排序
- 默认平台
- UI 偏好
- API Key
- 导入导出

---

## 六、页面流转关系

```
首页
  -> 资源列表
  -> 资源详情
  -> 新增资源

资源列表
  -> 资源详情
  -> 新增资源
  -> 编辑资源

资源详情
  -> 编辑
  -> 复制
  -> 来源链接

编辑
  -> 保存 -> 详情页
  -> 保存 -> 列表页
```

---

## 七、技术架构

```
User Browser
      │
      ▼
Next.js App (Vercel)
  - App Router
  - Server Components
  - Server Actions
  - UI Components
      │
      ▼
Supabase
  - PostgreSQL
  - Auth
  - RLS
  - Storage (optional)
      │
      ├─ Postgres Full Text Search
      │
      └─ Event Logging
```

---

## 八、AI 服务层（可选）

用于增强功能：
- 标签生成
- 摘要生成
- Prompt 改写
- 平台版本生成

**支持**：
- OpenAI
- Claude
- OpenRouter

---

## 九、Next.js 项目结构

```
src/
  app/
    page.tsx

    resources/
      page.tsx

      new/
        page.tsx

      [slug]/
        page.tsx

        edit/
          page.tsx

    settings/
      page.tsx

    api/
      resources/
      ai/

  components/
    resource/
      resource-card.tsx
      resource-filters.tsx
      resource-editor.tsx
      resource-variant-tabs.tsx

  lib/
    supabase/
      client.ts
      server.ts

    db/
      queries.ts

    ai/
      generate-tags.ts
      generate-summary.ts

  types/
    resource.ts
```

---

## 十、核心数据操作

**Resource**
- createResource
- updateResource
- deleteResource
- getResourceBySlug
- listResources
- searchResources

**Variant**
- createVariant
- updateVariant
- deleteVariant

**Tags**
- listTags
- createTag

**Events**
- logViewEvent
- logCopyEvent

**AI**
- generateSummary
- suggestTags
- generateVariant

---

## 十一、MVP 开发优先级

**P0**
- 登录
- 新增资源
- 编辑资源
- 列表页
- 详情页
- 搜索
- 标签
- Variant
- 复制

**P1**
- 收藏
- 最近使用
- 复制统计
- 自动摘要
- 自动标签

**P2**
- Markdown 导入
- JSON 导入
- 资源导出
- 相似推荐
- Meilisearch

---

## 十二、推荐开发节奏

**第 1 周**
- 建表
- 新增资源
- 编辑资源
- 列表页
- 详情页
- 复制功能

**第 2 周**
- 搜索
- 标签筛选
- Variant
- 收藏

**第 3 周**
- AI 标签
- AI 摘要
- 使用统计

---

## 十三、产品定位

一个供个人开发者使用的 AI Agent / Skills 资源库，用于统一录入、搜索、预览、适配并复制到第三方工具。
