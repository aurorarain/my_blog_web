# 📦 GitHub 同步功能使用指南

## 🎯 功能概述

您的博客现在支持将文章内容和封面图片同步到 GitHub 仓库，实现：
- ✅ 文章内容云端备份
- ✅ 封面图片自动上传
- ✅ 按分类自动归档
- ✅ 版本控制和历史记录

---

## 📋 仓库配置

### 您的 GitHub 仓库信息
- **仓库所有者**: `aurorarain`
- **仓库名称**: `my_blog_web_storage`
- **分支**: `main`

### 分类目录映射
| 分类 | GitHub 目录 |
|------|------------|
| 随笔 | `Essay/` |
| 编程技术 | `Coding/` |
| 算法 | `Algorithm/` |
| 计算机知识 | `CSKnowledge/` |
| 英语 | `English/` |
| 数学 | `Math/` |

---

## 🔑 创建 GitHub Personal Access Token (PAT)

### 步骤 1：访问 GitHub 设置
1. 登录 GitHub
2. 点击右上角头像 → **Settings**
3. 左侧菜单最底部 → **Developer settings**
4. 点击 **Personal access tokens** → **Tokens (classic)**
5. 点击 **Generate new token** → **Generate new token (classic)**

### 步骤 2：配置 Token
1. **Note**: 填写描述，如 `My Blog Web Storage`
2. **Expiration**: 选择过期时间（建议选择 **No expiration** 或 **90 days**）
3. **Select scopes**: 勾选以下权限
   - ✅ **repo** (完整的仓库访问权限)
     - ✅ repo:status
     - ✅ repo_deployment
     - ✅ public_repo
     - ✅ repo:invite
     - ✅ security_events

### 步骤 3：生成并保存 Token
1. 点击页面底部的 **Generate token**
2. **⚠️ 重要**：复制生成的 Token（只显示一次！）
3. 保存到安全的地方（如密码管理器）

Token 格式示例：`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 📝 使用方法

### 方法一：创建文章时同步

1. **进入博客页面**
   - 点击"博客" → "发布文章"

2. **填写文章信息**
   - **封面URL**: 输入图片链接（可选）
   - **本地封面**: 或选择本地图片文件上传
   - **标题**: 文章标题
   - **简介**: 文章简介
   - **分类**: 选择分类

3. **启用 GitHub 同步**
   - ✅ 勾选"发布到 GitHub 仓库"
   - 输入您的 **GitHub Token**

4. **输入主密码**
   - 输入：`jzh0128`

5. **点击"编辑正文"**
   - 进入富文本编辑器
   - 编写文章内容

6. **保存并同步**
   - 输入 **GitHub Token**（如果之前没输入）
   - 点击"💾 保存并同步"
   - 等待上传完成

### 方法二：编辑现有文章并同步

1. **打开文章编辑页**
   - 在文章列表点击"编辑"
   - 或在文章详情页点击"编辑"

2. **编辑内容**
   - 使用富文本编辑器修改内容

3. **同步到 GitHub**
   - 在编辑页面输入 **GitHub Token**
   - 点击"💾 保存并同步"

---

## 📂 文件存储结构

### 文章内容
```
my_blog_web_storage/
├── Essay/
│   ├── 示例文章_A.html
│   └── 我的随笔.html
├── Coding/
│   ├── JavaScript_教程.html
│   └── Python_入门.html
├── Algorithm/
│   └── 排序算法详解.html
├── CSKnowledge/
│   └── 计算机网络基础.html
├── English/
│   └── 英语学习笔记.html
└── Math/
    └── 微积分入门.html
```

### 封面图片
```
my_blog_web_storage/
├── Essay/
│   ├── 1234567890_cover.jpg
│   └── 1234567891_image.png
├── Coding/
│   ├── 1234567892_banner.jpg
│   └── 1234567893_thumbnail.png
└── ...
```

**说明**：
- 文章保存为 `.html` 文件
- 文件名根据标题自动生成（非中文字符替换为下划线）
- 封面图片使用时间戳前缀，避免重名

---

## 🖼️ 封面图片上传

### 方式一：使用图片 URL
1. 在"封面URL"输入框输入图片链接
2. 例如：`https://example.com/image.jpg`
3. 不会上传到 GitHub，直接引用外部链接

### 方式二：上传本地图片
1. 点击"本地封面"的"选择文件"按钮
2. 选择本地图片文件（支持 jpg, png, gif 等）
3. ✅ 勾选"发布到 GitHub 仓库"
4. 输入 **GitHub Token**
5. 点击"编辑正文"或"保存"

**自动处理**：
- 图片会自动上传到对应分类目录
- 生成 GitHub raw 链接
- 自动设置为文章封面

**示例**：
- 分类：随笔
- 上传文件：`my-photo.jpg`
- 保存路径：`Essay/1234567890_my-photo.jpg`
- 生成链接：`https://raw.githubusercontent.com/aurorarain/my_blog_web_storage/main/Essay/1234567890_my-photo.jpg`

---

## ⚙️ 同步流程说明

### 创建文章
1. 填写文章元数据（标题、简介、分类）
2. 如果选择了本地封面 → 上传封面到 GitHub
3. 创建文章记录（保存到本地）
4. 进入编辑器编写内容
5. 点击保存 → 上传文章内容到 GitHub

### 编辑文章
1. 修改文章内容
2. 点击保存 → 更新 GitHub 上的文章文件
3. 如果文件已存在，会覆盖更新

### 删除文章
1. 点击删除按钮（编辑页面或文章列表）
2. 输入主密码确认删除
3. 如果文章已同步到 GitHub：
   - 系统会提示输入 Token
   - 提供 Token → 同时删除本地和 GitHub 文件
   - 不提供 Token → 仅删除本地文章
4. 删除操作不可恢复，请谨慎操作

### 修改文章元数据（标题/分类）
1. 点击文章的"编辑"按钮（或编辑页面的"⚙️ 设置"）
2. 修改标题、分类等信息
3. 如果文章已同步到 GitHub 且标题/分类改变：
   - 勾选"发布到 GitHub 仓库"
   - 输入 GitHub Token
   - 系统会提示是否同步更新
   - 确认后会删除旧文件，创建新文件（新路径/新文件名）
4. 点击"保存"完成修改

---

## 🔒 安全提示

### Token 安全
- ⚠️ **不要分享您的 Token**
- ⚠️ **不要提交 Token 到代码仓库**
- ⚠️ **定期更换 Token**
- ✅ Token 仅在浏览器中使用，不会被保存

### 权限说明
- Token 具有仓库完整访问权限
- 可以读取、创建、修改、删除仓库文件
- 请妥善保管

### 如果 Token 泄露
1. 立即前往 GitHub Settings
2. 删除泄露的 Token
3. 生成新的 Token

---

## 💡 使用技巧

### 1. 批量上传
- 先创建多篇文章（不勾选同步）
- 编写完内容后
- 逐个打开编辑页面
- 输入 Token 并保存同步

### 2. 离线编辑
- 不输入 Token，文章保存在本地
- 有网络时再输入 Token 同步

### 3. 备份策略
- 定期同步所有文章到 GitHub
- GitHub 自动保留历史版本
- 可以随时恢复旧版本

### 4. 图片管理
- 建议使用本地上传功能
- 图片会自动归类到对应目录
- 使用 GitHub 作为图床

---

## 🐛 常见问题

### Q1: 上传失败，提示 401 错误
**A**: Token 无效或已过期
- 检查 Token 是否正确复制
- 检查 Token 是否已过期
- 重新生成新的 Token

### Q2: 上传失败，提示 404 错误
**A**: 仓库不存在或无权限
- 确认仓库名称：`aurorarain/my_blog_web_storage`
- 确认仓库是否存在
- 确认 Token 有访问该仓库的权限

### Q3: 封面图片上传失败
**A**: 可能的原因
- 图片文件过大（建议 < 5MB）
- Token 权限不足
- 网络连接问题

**解决方法**：
- 压缩图片后重试
- 使用图片 URL 代替本地上传

### Q4: 文章内容没有同步
**A**: 检查以下几点
- 是否输入了 Token
- 是否点击了"保存并同步"
- 查看浏览器控制台是否有错误信息

### Q5: 如何查看已同步的文章
**A**: 访问 GitHub 仓库
```
https://github.com/aurorarain/my_blog_web_storage
```
在对应分类目录下查看文件

### Q6: 修改了文章标题或分类，GitHub 上的文件会自动更新吗？
**A**: 需要手动触发同步
- 修改元数据时，勾选"发布到 GitHub 仓库"
- 输入 GitHub Token
- 系统会提示是否同步更新
- 确认后会删除旧路径的文件，在新路径创建文件
- 如果不提供 Token，仅更新本地数据

### Q7: 删除文章时，GitHub 上的文件会被删除吗？
**A**: 取决于是否提供 Token
- **提供 Token**：同时删除本地和 GitHub 文件
- **不提供 Token**：仅删除本地文章，GitHub 文件保留
- 两种删除方式（编辑页面删除/列表删除）都支持 GitHub 同步

---

## 📊 同步状态说明

### 文章状态标识
- **本地文章**：仅保存在浏览器 localStorage
- **已同步文章**：包含 `repoPath` 和 `repoSha` 字段

### 查看同步状态
打开浏览器控制台（F12），输入：
```javascript
console.log(JSON.parse(localStorage.getItem('myblog_posts')))
```

查看文章对象：
- `repoPath`: GitHub 文件路径（如 `Essay/示例文章.html`）
- `repoSha`: 文件的 SHA 值（用于更新）

---

## 🎉 总结

现在您可以：
- ✅ 将文章同步到 GitHub 云端备份
- ✅ 上传本地封面图片到 GitHub
- ✅ 按分类自动归档文章和图片
- ✅ 修改文章标题/分类时自动更新 GitHub 文件路径
- ✅ 删除文章时同步删除 GitHub 文件
- ✅ 随时从 GitHub 恢复文章
- ✅ 利用 GitHub 的版本控制功能

**开始使用 GitHub 同步功能，让您的博客更安全！** 🚀

