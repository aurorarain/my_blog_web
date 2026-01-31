# 存储架构说明

## 📦 双重存储方案

您的博客使用**双重存储架构**，结合了 JSONBin 和 GitHub 的优势。

### 存储分工

| 数据类型 | 存储位置 | 是否必需 | 说明 |
|---------|---------|---------|------|
| 文章元数据 | JSONBin | ✅ 必需 | 标题、简介、分类、封面URL、ID |
| 留言数据 | JSONBin | ✅ 必需 | 所有留言内容 |
| 文章内容 | JSONBin + GitHub | ⚠️ 可选 | HTML格式的正文 |
| 文章图片 | GitHub | ⚠️ 可选 | 文章内的图片文件 |
| 封面图片 | GitHub | ⚠️ 可选 | 本地上传的封面 |

---

## 🎯 两种使用模式

### 模式 1：仅使用 JSONBin（简单模式）

**适合场景**：
- 文章数量少（< 50篇）
- 文章内容不太长
- 不需要版本控制
- 追求简单配置

**配置要求**：
- ✅ 配置 JSONBin（已完成）
- ❌ 不需要配置 GitHub Token

**发布流程**：
1. 点击"发布文章"
2. 填写标题、简介、分类
3. **不勾选**"同步GitHub"
4. 编辑正文内容
5. 点击"保存"

**数据存储**：
```
JSONBin (云数据库)
├── posts (文章数组)
│   ├── id: 1234567890
│   ├── title: "我的第一篇博客"
│   ├── desc: "这是简介"
│   ├── category: "随笔"
│   ├── cover: "https://..."
│   └── content: "<h1>完整的HTML内容</h1>..."  ← 存储在这里
└── messages (留言数组)
    └── ...
```

**优点**：
- ✅ 配置简单，只需一个 JSONBin 账号
- ✅ 跨设备同步完美
- ✅ 实时更新（1秒内）

**缺点**：
- ⚠️ JSONBin 免费版单个 Bin 限制 100KB
- ⚠️ 无版本历史记录
- ⚠️ 文章内的图片仍以 Base64 存储（占用空间大）

---

### 模式 2：JSONBin + GitHub（推荐模式）

**适合场景**：
- 文章数量多（> 50篇）
- 文章内容较长
- 需要版本控制
- 需要图片 CDN

**配置要求**：
- ✅ 配置 JSONBin（已完成）
- ✅ 配置 GitHub Token（需要操作）

**发布流程**：
1. 点击"发布文章"
2. 填写标题、简介、分类
3. **勾选**"同步GitHub"
4. **输入 GitHub Token**
5. 编辑正文内容
6. 点击"保存并同步"

**数据存储**：
```
JSONBin (云数据库)
├── posts (文章数组)
│   ├── id: 1234567890
│   ├── title: "我的第一篇博客"
│   ├── desc: "这是简介"
│   ├── category: "随笔"
│   ├── cover: "https://raw.githubusercontent.com/..."
│   ├── content: ""  ← 为空或简短摘要
│   ├── repoPath: "Essay/my_first_blog.html"  ← GitHub路径
│   └── repoSha: "abc123..."
└── messages (留言数组)

GitHub (文件存储)
├── Essay/
│   ├── my_first_blog.html  ← 完整的文章内容
│   ├── my_first_blog_cover.jpg  ← 封面图片
│   ├── my_first_blog_img1.jpg  ← 文章内图片1
│   └── my_first_blog_img2.jpg  ← 文章内图片2
├── Coding/
└── Algorithm/
```

**优点**：
- ✅ 跨设备同步完美
- ✅ 无容量限制（GitHub 免费 1GB）
- ✅ 图片转换为 URL，节省空间
- ✅ 版本控制和历史记录
- ✅ 图片可作为 CDN 使用

**缺点**：
- ⚠️ 需要配置 GitHub Token
- ⚠️ 发布时需要勾选选项

---

## 🔄 跨设备同步机制

### 无论使用哪种模式，跨设备同步都完美工作！

**原理**：
- JSONBin 存储所有必要的元数据
- 其他设备打开网站时，自动从 JSONBin 拉取数据
- 如果文章有 `repoPath`，则从 GitHub 加载完整内容
- 如果文章有 `content`，则直接显示

**示例流程**：

```
设备 A（电脑）
  ↓ 发布文章
  ↓ 保存到 JSONBin
  ↓ （可选）上传到 GitHub
  ↓
JSONBin 云端
  ↓ 自动同步
  ↓
设备 B（手机）
  ↓ 打开网站
  ↓ 从 JSONBin 拉取数据
  ↓ 显示文章列表 ✅
  ↓ 点击文章
  ↓ 从 GitHub 加载内容（如果有）
  ↓ 显示完整文章 ✅
```

---

## 💡 推荐配置

### 方案 A：个人博客（< 50篇文章）

```javascript
// app.js 配置
const JSONBIN_BIN_ID = '697dbb0eae596e708f05e9f2'  // ✅ 已配置
const JSONBIN_API_KEY = '$2a$10$ufvYDpE1nsABcD6aBtTy6u5SX4lnvS/KY3.8KOWLMt6m6diInkIg.'  // ✅ 已配置

// 发布文章时
- ❌ 不勾选"同步GitHub"
- ✅ 直接保存即可
```

**结果**：文章存储在 JSONBin，跨设备完美同步 ✅

---

### 方案 B：长期博客（> 50篇文章）

```javascript
// app.js 配置
const JSONBIN_BIN_ID = '697dbb0eae596e708f05e9f2'  // ✅ 已配置
const JSONBIN_API_KEY = '$2a$10$ufvYDpE1nsABcD6aBtTy6u5SX4lnvS/KY3.8KOWLMt6m6diInkIg.'  // ✅ 已配置
const DATA_REPO_OWNER = 'aurorarain'  // ✅ 已配置
const DATA_REPO_NAME = 'my_blog_web_storage'  // ✅ 已配置

// 发布文章时
- ✅ 勾选"同步GitHub"
- ✅ 输入 GitHub Token
- ✅ 保存并同步
```

**结果**：
- 文章元数据存储在 JSONBin（跨设备同步）✅
- 文章内容存储在 GitHub（无容量限制）✅
- 图片存储在 GitHub（CDN加速）✅

---

## 📊 容量对比

### JSONBin 免费版限制

- **单个 Bin**: 100KB
- **API 调用**: 10,000次/月

**估算**：
- 1篇文章元数据（无内容）：~500 字节
- 1篇文章元数据（含内容）：~5KB（取决于内容长度）
- 1条留言：~200 字节

**仅元数据模式（推荐）**：
- 100KB ÷ 500字节 = **200篇文章** ✅
- 足够个人博客使用

**含内容模式**：
- 100KB ÷ 5KB = **20篇文章** ⚠️
- 容易超限

### GitHub 免费版限制

- **仓库大小**: 1GB
- **单文件**: 100MB
- **API 调用**: 5,000次/小时

**估算**：
- 1GB ÷ 5KB = **200,000篇文章** ✅
- 完全够用

---

## 🎯 最佳实践建议

### 推荐方案：混合模式

1. **配置 JSONBin**（已完成）✅
2. **配置 GitHub Token**（建议配置）
3. **发布文章时**：
   - 短文章（< 1000字）：不勾选 GitHub
   - 长文章（> 1000字）：勾选 GitHub
   - 含图片文章：必须勾选 GitHub

### 为什么推荐混合模式？

- ✅ 灵活性高：根据文章长度选择存储方式
- ✅ 节省空间：短文章直接存 JSONBin
- ✅ 无限容量：长文章存 GitHub
- ✅ 图片优化：图片自动转换为 CDN URL

---

## ❓ 常见问题

### Q1: 我必须配置 GitHub 吗？

**A**: 不必须。如果您的文章数量少（< 50篇），只配置 JSONBin 即可。

### Q2: 如果我不勾选"同步GitHub"，文章存在哪里？

**A**: 文章完整内容存储在 JSONBin 的 `posts[].content` 字段中。

### Q3: 如果我勾选"同步GitHub"，文章存在哪里？

**A**: 
- 文章元数据（标题、简介等）→ JSONBin
- 文章完整内容 → GitHub
- 文章内的图片 → GitHub

### Q4: 跨设备同步依赖什么？

**A**: 只依赖 JSONBin。无论文章存在哪里，元数据都在 JSONBin 中，所以跨设备同步完美工作。

### Q5: 我应该选择哪种模式？

**A**: 
- 如果您刚开始写博客：**仅 JSONBin**
- 如果您计划长期写作：**JSONBin + GitHub**
- 如果您的文章有很多图片：**必须 GitHub**

---

## 🔧 如何切换模式？

### 从"仅 JSONBin"切换到"JSONBin + GitHub"

1. 获取 GitHub Token
2. 编辑已有文章
3. 勾选"同步GitHub"
4. 输入 Token
5. 保存

**结果**：文章内容会上传到 GitHub，JSONBin 中的 `content` 字段会被清空。

### 从"JSONBin + GitHub"切换到"仅 JSONBin"

1. 编辑文章
2. 不勾选"同步GitHub"
3. 保存

**结果**：文章内容会保存到 JSONBin，GitHub 中的文件不会被删除（作为备份）。

---

## 📞 技术支持

如有疑问，请查看：
- **SETUP_GUIDE.md** - 详细配置指南
- **README.md** - 项目说明

---

**总结**：JSONBin 负责跨设备同步，GitHub 负责大容量存储。两者配合使用效果最佳！🎉

