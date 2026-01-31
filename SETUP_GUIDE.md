# 🚀 MyBlog 完整配置指南

## 📋 目录
1. [Supabase 配置](#1-supabase-配置)
2. [GitHub 配置](#2-github-配置)
3. [首次使用](#3-首次使用)
4. [常见问题](#4-常见问题)
5. [数据管理](#5-数据管理)

---

## 1. Supabase 配置

### 步骤 1：注册账号
访问 [https://supabase.com/](https://supabase.com/) 注册免费账号

### 步骤 2：创建项目
1. 点击 "New Project"
2. 填写项目信息：
   - **Name**: MyBlog
   - **Database Password**: 设置强密码（记住它）
   - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
3. 点击 "Create new project"，等待 1-2 分钟

### 步骤 3：创建数据表
1. 进入项目后，点击左侧 "Table Editor"
2. 点击 "Create a new table"
3. 配置表结构：
   - **Name**: `blog_data`
   - **Description**: Blog posts and messages data
   - **Enable Row Level Security (RLS)**: ❌ **取消勾选**（重要！）

4. 添加以下列（Columns）：

| Name | Type | Default Value | Primary | Nullable |
|------|------|---------------|---------|----------|
| id | int8 | (自动生成) | ✅ | ❌ |
| created_at | timestamptz | `now()` | ❌ | ❌ |
| posts | jsonb | - | ❌ | ✅ |
| messages | jsonb | - | ❌ | ✅ |
| last_modified | int8 | - | ❌ | ✅ |
| version | text | - | ❌ | ✅ |

5. 点击 "Save" 创建表

### 步骤 4：插入初始数据（重要！）
1. 点击 "Insert row"
2. 填写：
   - `posts`: `[]`
   - `messages`: `[]`
   - `last_modified`: `1738329600000`
   - `version`: `1.1.0`
3. 点击 "Save"

**⚠️ 重要提示**：
- **只需要一条记录**，所有文章和留言都存储在这条记录中
- **不要删除这条记录**，否则同步会失败
- **不要手动添加多条记录**，系统只使用第一条

### 步骤 5：获取 API 密钥
1. 点击左侧 "Project Settings" → "API"
2. 找到以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（很长的字符串）

### 步骤 6：配置应用
打开 `app.js`，找到第 17-19 行，替换为您的配置：

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co' // 替换为您的 Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // 替换为您的 anon public key
const SUPABASE_TABLE_NAME = 'blog_data' // 保持不变
```

---

## 2. GitHub 配置

### 步骤 1：创建 GitHub 仓库
1. 访问 [https://github.com/new](https://github.com/new)
2. 创建一个新仓库（例如：`my-blog-storage`）
3. 设置为 **Public**（这样图片可以直接访问）

### 步骤 2：生成 Personal Access Token
1. 访问 [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 配置权限：
   - **Note**: MyBlog Storage
   - **Expiration**: No expiration
   - **Select scopes**: 勾选 `repo`（完整仓库访问权限）
4. 点击 "Generate token"，**复制并保存** Token（只显示一次！）

### 步骤 3：配置应用
打开 `app.js`，找到第 22-24 行，替换为您的配置：

```javascript
const DATA_REPO_OWNER = 'your-github-username' // 您的 GitHub 用户名
const DATA_REPO_NAME = 'my-blog-storage' // 您的仓库名
const DATA_REPO_BRANCH = 'main' // 分支名（通常是 main）
```

---

## 3. 首次使用

### 步骤 1：清除浏览器缓存
在浏览器控制台（F12）运行：
```javascript
localStorage.clear()
location.reload()
```

### 步骤 2：验证同步
1. 刷新页面（Ctrl+F5）
2. 打开控制台（F12）
3. 应该看到：
```
📡 正在从云端同步数据...
📥 开始拉取云端数据...
✅ 拉取成功，记录数: 1
📌 记录 ID: 1
📄 文章数: 0 💬 留言数: 0
✅ 数据同步成功
```

### 步骤 3：发布第一篇文章
1. 点击 "博客" → "发布文章"
2. 输入主密码：`jzh0128`（可在 `app.js` 第 237 行修改）
3. 填写文章信息
4. 勾选 "同步 GitHub"，输入 GitHub Token
5. 点击 "编辑正文"
6. 编写文章内容
7. 点击 "保存并同步到 GitHub"

### 步骤 4：验证数据
1. 登录 Supabase → Table Editor
2. 查看 `blog_data` 表
3. 应该看到 `posts` 字段包含您的文章元数据
4. 登录 GitHub 仓库
5. 应该看到文章 HTML 文件和图片

---

## 4. 常见问题

### Q1: 为什么 Supabase 表中只有一条记录？
**A**: 这是正确的设计！所有文章和留言都存储在这条记录的 `posts` 和 `messages` 字段中（JSONB 格式）。

```
Supabase 表结构：
┌────┬──────────────────┬──────────────────┬───────────────┐
│ id │ posts            │ messages         │ last_modified │
├────┼──────────────────┼──────────────────┼───────────────┤
│ 1  │ [{文章1}, {文章2}] │ [{留言1}, {留言2}] │ 1738329600000 │
└────┴──────────────────┴──────────────────┴───────────────┘
```

### Q2: 删除文章后，Supabase 表中的记录会删除吗？
**A**: 不会！记录本身不会删除，只是 `posts` 数组中的文章数据会被移除。

```
删除前：posts: [{id: 1, title: "文章A"}, {id: 2, title: "文章B"}]
删除后：posts: [{id: 2, title: "文章B"}]
```

### Q3: 我不小心删除了 Supabase 表中的记录，怎么办？
**A**: 重新插入一条初始数据：
1. 进入 Table Editor → `blog_data` 表
2. 点击 "Insert row"
3. 填写：
   - `posts`: `[]`
   - `messages`: `[]`
   - `last_modified`: `1738329600000`
   - `version`: `1.1.0`
4. 刷新网站，数据会自动同步

### Q4: 文章内容存储在哪里？
**A**: 
- **未上传 GitHub 的文章**：完整内容存储在 Supabase 的 `posts` 数组中
- **已上传 GitHub 的文章**：Supabase 只存储元数据，完整内容存储在 GitHub

### Q5: 如何删除示例文章？
**A**: 
1. 在网站上点击文章的"删除"按钮
2. 输入主密码
3. 系统会自动从 Supabase 和 GitHub 删除

**不要在 Supabase 中手动删除！**

### Q6: 删除功能失效怎么办？
**A**: 检查以下几点：
1. 确认 Supabase 表中有一条记录
2. 确认 RLS（Row Level Security）已关闭
3. 清除浏览器缓存：`localStorage.clear()`
4. 查看控制台错误信息

---

## 5. 数据管理

### 数据备份

#### 方法 1：Supabase 备份
1. 进入 Supabase → Table Editor
2. 选择 `blog_data` 表
3. 点击 "Export" → "CSV"

#### 方法 2：LocalStorage 备份
在浏览器控制台运行：
```javascript
const backup = {
    posts: localStorage.getItem('myblog_posts'),
    messages: localStorage.getItem('myblog_msgs'),
    supabase_record_id: localStorage.getItem('supabase_record_id'),
    github_token: localStorage.getItem('github_sync_token')
}
console.log(JSON.stringify(backup))
// 复制输出的 JSON 数据保存到文件
```

### 数据恢复

#### 从 LocalStorage 备份恢复
在浏览器控制台运行：
```javascript
const backup = {
    // 粘贴您的备份数据
}
localStorage.setItem('myblog_posts', backup.posts)
localStorage.setItem('myblog_msgs', backup.messages)
localStorage.setItem('supabase_record_id', backup.supabase_record_id)
localStorage.setItem('github_sync_token', backup.github_token)
location.reload()
```

### 数据迁移

#### 迁移到新的 Supabase 项目
1. 导出旧项目的数据（CSV）
2. 在新项目创建相同的表结构
3. 导入 CSV 数据
4. 更新 `app.js` 中的 Supabase 配置
5. 清除浏览器缓存：`localStorage.clear()`
6. 刷新页面

### 数据清理

#### 清理本地缓存
```javascript
localStorage.clear()
location.reload()
```

#### 清理 Supabase 数据
1. 进入 Table Editor → `blog_data` 表
2. 点击记录的编辑按钮
3. 修改 `posts` 为 `[]`
4. 修改 `messages` 为 `[]`
5. 点击 "Save"

#### 清理 GitHub 文件
1. 进入 GitHub 仓库
2. 手动删除文件夹中的文件
3. 或使用 Git 命令批量删除

---

## 📊 数据结构说明

### Supabase 数据结构
```json
{
  "id": 1,
  "created_at": "2024-01-31T12:00:00Z",
  "posts": [
    {
      "id": 1738329600000,
      "type": "article",
      "title": "我的第一篇文章",
      "desc": "文章简介",
      "category": "随笔",
      "cover": "https://...",
      "repoPath": "Essay/my_first_article.html",
      "repoSha": "abc123...",
      "lastModified": 1738329600000
    }
  ],
  "messages": [
    {
      "nick": "访客",
      "text": "你好！",
      "t": 1738329600000,
      "pwd": "password"
    }
  ],
  "last_modified": 1738329600000,
  "version": "1.1.0"
}
```

### LocalStorage 数据结构
```javascript
// 文章数据
localStorage.getItem('myblog_posts')
// [{id: 1, title: "...", content: "..."}]

// 留言数据
localStorage.getItem('myblog_msgs')
// [{nick: "访客", text: "...", t: 1738329600000}]

// Supabase 记录 ID
localStorage.getItem('supabase_record_id')
// "1"

// GitHub Token
localStorage.getItem('github_sync_token')
// "ghp_xxxxxxxxxxxx"
```

---

## 🎯 最佳实践

### 1. 定期备份
- 每周备份一次 Supabase 数据（CSV）
- 每月备份一次 LocalStorage 数据（JSON）

### 2. 使用 GitHub 存储
- 建议将文章内容上传到 GitHub
- 节省 Supabase 空间（500MB 免费额度）
- GitHub 提供无限空间

### 3. 密码管理
- 修改默认主密码（`app.js` 第 237 行）
- 不要在代码中硬编码敏感信息
- GitHub Token 只存储在本地

### 4. 性能优化
- 文章封面使用 CDN 或图床
- 文章内容上传到 GitHub
- 定期清理无用的图片文件

### 5. 安全建议
- 启用 Supabase RLS（如果需要多用户）
- 定期更换 GitHub Token
- 不要将 Token 提交到公开仓库

---

## 📞 获取帮助

如果遇到问题，请：
1. 查看浏览器控制台错误信息
2. 参考 `TROUBLESHOOTING.md` 故障排查指南
3. 查看 `README.md` 完整文档
4. 联系开发者：1839735394@qq.com

---

**祝您使用愉快！🎉**

