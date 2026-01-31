# 📝 MyBlog - 个人博客系统

一个现代化的个人博客系统，支持富文本编辑、GitHub 文章存储、Supabase 云端同步、PWA 离线访问。

## ✨ 核心特性

- 📱 **PWA 支持**：可安装到桌面，支持离线访问
- ☁️ **云端同步**：基于 Supabase，跨设备实时同步
- 🎨 **富文本编辑**：集成 Quill 编辑器，支持图片、代码、表格等
- 🗂️ **GitHub 存储**：文章内容和图片存储到 GitHub，节省空间
- 💬 **留言板**：支持访客留言，密码保护删除功能
- 🌍 **多语言**：支持中文/英文切换
- 🎯 **分类管理**：支持多种文章分类
- 🔒 **密码保护**：主密码保护文章发布/编辑/删除

## 🚀 快速开始

### 1️⃣ 配置 Supabase（5分钟）

#### 步骤 1：注册 Supabase 账号
访问 [https://supabase.com/](https://supabase.com/) 注册免费账号

#### 步骤 2：创建项目
1. 点击 "New Project"
2. 填写项目信息：
   - **Name**: MyBlog
   - **Database Password**: 设置一个强密码（记住它）
   - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`（离中国最近）
3. 点击 "Create new project"，等待 1-2 分钟

#### 步骤 3：创建数据表
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
| posts | jsonb | `[]` | ❌ | ✅ |
| messages | jsonb | `[]` | ❌ | ✅ |
| last_modified | int8 | - | ❌ | ✅ |
| version | text | - | ❌ | ✅ |
| created_at | timestamptz | `now()` | ❌ | ❌ |
| updated_at | timestamptz | `now()` | ❌ | ❌ |

5. 点击 "Save" 创建表

#### 步骤 4：获取 API 密钥
1. 点击左侧 "Project Settings" → "API"
2. 找到以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（很长的字符串）

#### 步骤 5：配置应用
打开 `app.js`，找到第 15-19 行，替换为您的配置：

```javascript
const SUPABASE_URL = 'https://xxxxx.supabase.co' // 替换为您的 Project URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // 替换为您的 anon public key
const SUPABASE_TABLE_NAME = 'blog_data' // 保持不变
```

### 2️⃣ 配置 GitHub 存储（可选，用于存储文章内容）

#### 步骤 1：创建 GitHub 仓库
1. 访问 [https://github.com/new](https://github.com/new)
2. 创建一个新仓库（例如：`my-blog-storage`）
3. 设置为 **Public**（这样图片可以直接访问）

#### 步骤 2：生成 Personal Access Token
1. 访问 [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 配置权限：
   - **Note**: MyBlog Storage
   - **Expiration**: No expiration
   - **Select scopes**: 勾选 `repo`（完整仓库访问权限）
4. 点击 "Generate token"，**复制并保存** Token（只显示一次！）

#### 步骤 3：配置应用
打开 `app.js`，找到第 24-27 行，替换为您的配置：

```javascript
const DATA_REPO_OWNER = 'your-github-username' // 您的 GitHub 用户名
const DATA_REPO_NAME = 'my-blog-storage' // 您的仓库名
const DATA_REPO_BRANCH = 'main' // 分支名（通常是 main）
```

### 3️⃣ 部署应用

#### 方式 1：GitHub Pages（推荐）
1. 将所有文件上传到 GitHub 仓库
2. 进入仓库 Settings → Pages
3. Source 选择 `main` 分支
4. 保存后等待几分钟，访问 `https://your-username.github.io/repo-name/`

#### 方式 2：本地运行
```bash
# 使用 Python 启动本地服务器
python -m http.server 8000

# 或使用 Node.js
npx http-server -p 8000
```

访问 `http://localhost:8000`

## 📖 使用指南

### 发布文章
1. 点击 "博客" → "发布文章"
2. 输入主密码（默认：`jzh0128`，请在 `app.js` 第 237 行修改）
3. 填写文章信息：
   - **封面**：可以输入 URL 或上传本地图片
   - **标题**：文章标题
   - **简介**：文章简介
   - **分类**：选择分类
   - **同步 GitHub**：勾选后需要输入 GitHub Token
4. 点击 "编辑正文" 进入富文本编辑器
5. 编辑完成后点击 "保存并同步到 GitHub"

### 编辑文章
1. 在文章列表中点击 "编辑"
2. 修改元数据或点击 "编辑正文"
3. 保存后自动同步到云端

### 删除文章
1. 在编辑页面点击 "删除"
2. 输入主密码确认
3. 如果文章已同步到 GitHub，需要输入 Token 才能删除远程文件

### 留言板
1. 访客可以直接留言
2. 设置昵称和密码后可以删除自己的留言
3. 主密码可以删除任何留言

## 🔧 配置说明

### 主密码
在 `app.js` 第 237 行修改：
```javascript
const MASTER = 'your-password' // 修改为您的密码
```

### 个人信息
在 `app.js` 第 4-13 行修改：
```javascript
const USER_NAME_ZH = '您的名字'
const USER_BIO_ZH = '您的简介'
const USER_NAME_EN = 'Your Name'
const USER_BIO_EN = 'Your Bio'
const USER_CONTACT = [
    { type: 'Email', value: 'your@email.com' },
    { type: 'GitHub', value: 'https://github.com/yourusername' }
]
```

### 背景图片和头像
替换以下文件：
- `background.png` - 背景图片
- `my_photo.png` - 头像

### 文章分类
在 `app.js` 第 256 行修改：
```javascript
const categories = ['随笔', '编程技术', '算法', '计算机知识', '英语', '数学']
```

## 🏗️ 技术架构

### 前端技术栈
- **HTML5 + CSS3 + JavaScript**：原生开发，无框架依赖
- **Quill.js**：富文本编辑器
- **Service Worker**：PWA 支持，离线缓存
- **LocalStorage**：本地数据存储

### 数据存储方案
1. **Supabase**：存储文章元数据和留言（免费 500MB）
2. **GitHub**：存储文章内容和图片（无限空间）
3. **LocalStorage**：本地缓存，离线访问

### 数据同步机制
- **自动同步**：发布/编辑/删除文章后自动同步
- **定期同步**：每 5 分钟自动同步一次
- **页面切换同步**：页面重新可见时自动同步
- **超时控制**：10 秒超时，失败自动回滚

### 性能优化
- **懒加载**：图片懒加载，减少初始加载时间
- **代码分割**：Quill 编辑器按需加载
- **缓存策略**：Service Worker 缓存静态资源
- **事件委托**：减少事件监听器数量
- **批量 DOM 更新**：使用 DocumentFragment 优化渲染

## 📊 数据结构

### 文章数据（posts）
```json
{
  "id": 1234567890,
  "type": "article",
  "title": "文章标题",
  "desc": "文章简介",
  "category": "编程技术",
  "cover": "https://...",
  "content": "<h1>文章内容</h1>",
  "repoPath": "Coding/article_123.html",
  "repoSha": "abc123...",
  "lastModified": 1234567890
}
```

### 留言数据（messages）
```json
{
  "nick": "访客",
  "text": "留言内容",
  "t": 1234567890,
  "pwd": "password"
}
```

## 🔒 安全说明

### 密码保护
- **主密码**：保护文章发布/编辑/删除
- **留言密码**：保护留言删除
- **GitHub Token**：仅存储在本地 LocalStorage，不上传到云端

### 数据隐私
- **Supabase**：数据存储在 Supabase 云端，支持 SSL 加密
- **GitHub**：文章内容存储在您的 GitHub 仓库，完全由您控制
- **LocalStorage**：本地数据仅存储在浏览器，不会泄露

### 建议
1. **修改主密码**：默认密码 `jzh0128` 不安全，请立即修改
2. **保护 Token**：不要将 GitHub Token 分享给他人
3. **定期备份**：定期导出 Supabase 数据备份

## ❓ 常见问题

### Q1: Supabase 同步失败怎么办？
**A**: 检查以下几点：
1. 确认 Supabase 配置正确（URL 和 Key）
2. 确认数据表 `blog_data` 已创建
3. 确认 **RLS（Row Level Security）已关闭**
4. 检查浏览器控制台错误信息
5. 检查网络连接

### Q2: GitHub 同步失败怎么办？
**A**: 检查以下几点：
1. 确认 GitHub Token 有效且权限正确（需要 `repo` 权限）
2. 确认仓库名和用户名配置正确
3. 确认仓库是 Public（Private 仓库图片无法直接访问）
4. 检查网络连接

### Q3: 如何迁移数据？
**A**: 
1. 导出旧数据：打开浏览器控制台，运行 `localStorage.getItem('myblog_posts')`
2. 复制输出的 JSON 数据
3. 在新设备导入：运行 `localStorage.setItem('myblog_posts', '粘贴的JSON数据')`
4. 刷新页面，数据会自动同步到云端

### Q4: 如何更换 Supabase 项目？
**A**:
1. 修改 `app.js` 中的 Supabase 配置
2. 清除浏览器 LocalStorage：`localStorage.clear()`
3. 刷新页面，数据会自动同步到新项目

### Q5: 如何自定义样式？
**A**: 修改 `styles.css` 文件，主要变量：
```css
:root {
    --primary-color: #0969da;
    --bg-color: #f6f8fa;
    --card-bg: #ffffff;
    --text-color: #24292f;
}
```

### Q6: 为什么图片加载很慢？
**A**: 
1. GitHub Raw 图片在国内访问较慢，建议使用 CDN 加速
2. 可以使用 jsDelivr CDN：`https://cdn.jsdelivr.net/gh/用户名/仓库名@分支/路径`
3. 或使用图床服务（如：SM.MS、ImgBB）

### Q7: 如何备份数据？
**A**:
1. **Supabase 备份**：进入 Supabase 项目 → Table Editor → 导出 CSV
2. **LocalStorage 备份**：浏览器控制台运行：
   ```javascript
   const backup = {
       posts: localStorage.getItem('myblog_posts'),
       messages: localStorage.getItem('myblog_msgs')
   }
   console.log(JSON.stringify(backup))
   ```
3. **GitHub 备份**：文章内容已自动备份到 GitHub 仓库

## 📝 更新日志

### v1.0.7 (2024-01-31)
- ✅ 切换到 Supabase 数据存储（替代 LeanCloud）
- ✅ 优化同步机制，增加超时控制和自动回滚
- ✅ 移除手动同步按钮，改为完全自动同步
- ✅ 优化性能，减少事件监听器数量
- ✅ 更新文档，添加详细配置指南

### v1.0.6 (2024-01-30)
- ✅ 切换到 LeanCloud 数据存储（替代 JSONBin）
- ✅ 优化同步速度，国内访问提升 5 倍
- ✅ 增加自动回滚机制，同步失败自动恢复
- ✅ 优化错误提示，增加详细反馈

### v1.0.5 (2024-01-29)
- ✅ 初始版本发布
- ✅ 支持富文本编辑
- ✅ 支持 GitHub 文章存储
- ✅ 支持 JSONBin 云端同步
- ✅ 支持 PWA 离线访问

## 📄 开源协议

MIT License - 自由使用、修改、分发

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

- **Email**: 1839735394@qq.com
- **GitHub**: [@aurorarain](https://github.com/aurorarain)

---

**⭐ 如果这个项目对您有帮助，请给个 Star 支持一下！**
