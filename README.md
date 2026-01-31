# 个人博客网站

一个现代化的个人博客网站，支持文章发布、分类管理、留言板功能，并实现**跨设备云同步**。

## ✨ 核心特性

### 🌐 跨设备云同步
- **真正的云同步**：使用 JSONBin.io 云数据库，所有设备自动同步
- **无需配置**：配置一次，所有设备自动生效
- **实时更新**：数据变更后 1 秒内自动同步
- **智能合并**：自动处理多设备数据冲突

### 📝 文章管理
- **富文本编辑器**：基于 Quill.js，支持图片自由缩放
- **分类管理**：6 大分类（随笔、编程技术、算法、计算机知识、英语、数学）
- **封面图片**：支持 URL 和本地上传
- **GitHub 存储**：文章内容和图片自动上传到 GitHub

### 💬 留言板
- **访客留言**：支持匿名或设置昵称
- **密码保护**：设置密码后可删除自己的留言
- **实时同步**：留言自动同步到所有设备

### 🚀 性能优化
- **自动更新**：检测新版本自动清除缓存
- **智能缓存**：Service Worker 实现离线访问
- **懒加载**：图片按需加载
- **防抖节流**：减少不必要的网络请求

### 🌍 多语言支持
- 中文/英文界面切换
- 自动翻译所有 UI 元素

## 🚀 快速开始

### 第 1 步：配置云同步（必需）

**详细配置请查看 [SETUP_GUIDE.md](./SETUP_GUIDE.md)**

1. 注册 [JSONBin.io](https://jsonbin.io/) 账号（免费）
2. 创建 API Key 和 Bin
3. 修改 `app.js` 第 15-17 行：

```javascript
const JSONBIN_BIN_ID = '您的_BIN_ID'
const JSONBIN_API_KEY = '您的_API_KEY'
```

### 第 2 步：配置个人信息

编辑 `app.js` 文件：

```javascript
// 个人信息
const USER_NAME_ZH = '你的名字'
const USER_BIO_ZH = '你的简介'
const USER_CONTACT = [
    { type: 'Email', value: 'your@email.com' },
    { type: 'GitHub', value: 'https://github.com/yourusername' }
]

// 管理员密码（用于发布/编辑/删除文章）
const MASTER = 'your_password'
```

### 第 3 步：配置 GitHub（可选）

用于存储文章内容和图片：

```javascript
const DATA_REPO_OWNER = 'your-github-username'
const DATA_REPO_NAME = 'your-repo-name'
```

发布文章时输入 GitHub Token 即可同步。

### 第 4 步：部署

将所有文件上传到网站服务器即可。

## 📖 使用说明

### 发布文章

1. 点击"发布文章"
2. 填写标题、简介、分类、封面
3. 输入管理员密码
4. 点击"编辑正文"进入富文本编辑器
5. 保存后自动同步到云端

### 查看同步状态

页面右上角显示：
- `🟢 云同步 | 最后: 01/31 14:30` - 最后同步时间
- 点击 **🔄 同步** 按钮手动同步

### 跨设备访问

在任何设备打开网站，数据会自动从云端加载，无需任何配置！

## 📁 文件结构

```
MyBlogWeb/
├── index.html          # 主页面
├── app.js              # 核心逻辑（包含云同步）
├── styles.css          # 样式文件
├── sw.js               # Service Worker（缓存管理）
├── background.png      # 背景图片
├── my_photo.png        # 头像图片
├── SETUP_GUIDE.md      # 详细配置指南
└── README.md           # 本文档
```

## 🔧 技术栈

- **前端**：原生 JavaScript（无框架依赖）
- **编辑器**：Quill.js
- **云存储**：JSONBin.io（文章和留言数据）
- **文件存储**：GitHub API（文章内容和图片）
- **缓存**：Service Worker
- **本地存储**：localStorage

## 🎯 同步机制

### 自动同步
- **实时同步**：数据变更后 1 秒自动同步
- **定期同步**：每 2 分钟自动同步
- **页面切换同步**：切换回网页时自动同步
- **关闭前同步**：关闭网页前自动保存

### 数据安全
- 数据同时存储在本地和云端
- 自动处理冲突（保留最新版本）
- 网络断开时数据保存在本地

## 🔄 版本更新机制

### 自动更新（无需用户操作）

修改 `app.js` 第 2 行的版本号：

```javascript
const APP_VERSION = '1.0.4'  // 更新版本号
```

用户打开网站时会自动：
1. ✅ 检测新版本
2. ✅ 清除所有旧缓存
3. ✅ 注销旧 Service Worker
4. ✅ 加载最新代码
5. ✅ 自动刷新页面

**用户无需按 Ctrl+F5 或手动清除缓存！**

## ⚡ 性能优化

### 缓存策略
- **HTML**：不缓存（始终最新）
- **CSS/JS**：Stale-While-Revalidate（先显示缓存，后台更新）
- **图片**：长期缓存

### 网络优化
- DNS 预解析（CDN、API）
- 资源预加载
- 图片懒加载

### 代码优化
- 事件委托（减少监听器）
- 防抖节流（减少调用）
- DocumentFragment（批量 DOM 更新）

## ❓ 常见问题

### Q1: 其他设备看不到我的文章？

**A:** 检查 `app.js` 中的 `JSONBIN_BIN_ID` 和 `JSONBIN_API_KEY` 是否配置正确。打开浏览器控制台（F12）查看同步日志。

### Q2: 如何备份数据？

**A:** 数据自动备份在 JSONBin 云端。也可以在浏览器控制台导出本地数据：
```javascript
console.log(localStorage.getItem('myblog_posts'))
console.log(localStorage.getItem('myblog_msgs'))
```

### Q3: 免费版有限制吗？

**A:** JSONBin 免费版每月 10,000 次 API 调用，个人博客完全够用。

### Q4: 如何清除所有数据？

**A:** 在浏览器控制台执行：
```javascript
localStorage.clear()
location.reload()
```

更多问题请查看 [SETUP_GUIDE.md](./SETUP_GUIDE.md)

## 🔐 安全建议

1. ⚠️ **不要将 API Key 提交到公开仓库**
2. ✅ 使用强密码作为管理员密码
3. ✅ 定期更换 API Key
4. ✅ 使用 HTTPS 部署网站

## 📝 更新日志

### v1.0.4 (2025-01-31)
- ✅ **重大更新**：改用 JSONBin.io 云数据库，实现真正的跨设备同步
- ✅ 移除 GitHub Token 配置，简化使用流程
- ✅ 优化自动同步机制（1秒防抖 + 2分钟定期同步）
- ✅ 增强版本检测和缓存清除机制
- ✅ 优化性能和用户体验

### v1.0.3 (2025-01-30)
- ✅ 实现 GitHub 数据同步（已废弃）
- ✅ 添加自动版本检测
- ✅ 优化缓存策略

### v1.0.2 (2025-01-29)
- ✅ 添加富文本编辑器
- ✅ 实现图片自由缩放

### v1.0.1 (2025-01-28)
- ✅ 基础功能实现

## 📞 联系方式

- **作者**：嵇志豪 (ZhoJimmy)
- **Email**：1839735394@qq.com
- **GitHub**：https://github.com/aurorarain

## 📄 许可证

MIT License

---

**感谢使用！如有问题欢迎反馈。🎉**
