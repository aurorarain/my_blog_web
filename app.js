//230行文章后端添加区

// 配置区
const APP_VERSION = '1.1.0' // 版本号，更新后会清除旧缓存
const BG_IMAGE = 'background.png'
const USER_PHOTO = 'my_photo.png'
const USER_NAME_ZH = '嵇志豪'
const USER_BIO_ZH = '你好！我是一名26届计算机科学与技术专业本科生，热爱用代码解决实际问题。熟悉 Java 后端开发与 MySQL 数据库设计，能独立完成从前端交互到后端接口、数据库搭建再到服务器部署的完整项目流程，注重代码质量与用户体验。努力学习新技术ing，期待在实战中持续成长。欢迎联系我，一起做点有意思的事！'
const USER_NAME_EN = 'ZhoJimmy'
const USER_BIO_EN = 'Hello! I am a 26th-year undergraduate student majoring in Computer Science and Technology, passionate about solving practical problems with code. Proficient in Java backend development and MySQL database design, capable of independently completing the entire project workflow from frontend interaction to backend interfaces, database setup, and server deployment. I prioritize code quality and user experience. Continuously learning new technologies, eager to grow through hands-on practice. Feel free to reach out—I\'d love to collaborate on something exciting!'
const USER_CONTACT = [
    { type: 'Email', value: '1839735394@qq.com' },
    { type: 'GitHub', value: 'https://github.com/aurorarain' }
]


// ==================== Supabase 数据存储配置（必需配置）====================
// 用途：存储文章元数据、留言数据，实现跨设备同步
// 注册地址：https://supabase.com/
// 永久免费：500MB 数据库 + 1GB 文件存储 + 50,000 月活用户
const SUPABASE_URL = 'https://ncpzijtvomuhrbiypqaq.supabase.co' // 您的项目 URL
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jcHppanR2b211aHJiaXlwcWFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4NDU2MTUsImV4cCI6MjA4NTQyMTYxNX0.ouQAv0w54xUo87Ko3mzs3Tknk8Ze8X9aH-KRLSqcquI' // 您的 anon public key
const SUPABASE_TABLE_NAME = 'blog_data' // 数据表名

// GitHub 文章内容存储配置（仅用于存储文章 HTML 和图片）
const DATA_REPO_OWNER = 'aurorarain'
const DATA_REPO_NAME = 'my_blog_web_storage'
const DATA_REPO_BRANCH = 'main'
const GITHUB_TOKEN_KEY = 'github_sync_token' // localStorage 中存储 token 的 key

// 性能优化工具函数
function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

function throttle(func, limit) {
    let inThrottle
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args)
            inThrottle = true
            setTimeout(() => inThrottle = false, limit)
        }
    }
}

// 批量 DOM 更新
function batchDOMUpdate(callback) {
    requestAnimationFrame(() => {
        callback()
    })
}

// 自定义弹窗组件
function showDialog({ title = '提示', message = '', type = 'alert', inputType = 'text', placeholder = '', defaultValue = '' } = {}) {
    return new Promise((resolve) => {
        const backdrop = document.createElement('div')
        backdrop.className = 'dialog-backdrop'

        const dialog = document.createElement('div')
        dialog.className = 'dialog-box'

        let inputHtml = ''
        if (type === 'prompt') {
            inputHtml = `<input type="${inputType}" id="dialog-input" class="dialog-input" placeholder="${placeholder}" value="${defaultValue}">`
        }

        let buttonsHtml = ''
        if (type === 'confirm' || type === 'prompt') {
            buttonsHtml = `
                <button id="dialog-cancel" class="dialog-btn dialog-btn-cancel">取消</button>
                <button id="dialog-ok" class="dialog-btn dialog-btn-ok">确定</button>
            `
        } else {
            buttonsHtml = `<button id="dialog-ok" class="dialog-btn dialog-btn-ok">确定</button>`
        }

        dialog.innerHTML = `
            <div class="dialog-header">${title}</div>
            <div class="dialog-body">
                <div class="dialog-message">${message}</div>
                ${inputHtml}
            </div>
            <div class="dialog-footer">
                ${buttonsHtml}
            </div>
        `

        backdrop.appendChild(dialog)
        document.body.appendChild(backdrop)

        // 聚焦输入框
        if (type === 'prompt') {
            setTimeout(() => {
                const input = document.getElementById('dialog-input')
                if (input) input.focus()
            }, 100)
        }

        // 确定按钮
        const okBtn = document.getElementById('dialog-ok')
        okBtn.addEventListener('click', () => {
            if (type === 'prompt') {
                const input = document.getElementById('dialog-input')
                resolve(input ? input.value : null)
            } else if (type === 'confirm') {
                resolve(true)
            } else {
                resolve(true)
            }
            document.body.removeChild(backdrop)
        })

        // 取消按钮
        const cancelBtn = document.getElementById('dialog-cancel')
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                resolve(type === 'prompt' ? null : false)
                document.body.removeChild(backdrop)
            })
        }

        // 点击背景关闭
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                resolve(type === 'prompt' ? null : false)
                document.body.removeChild(backdrop)
            }
        })

        // ESC 键关闭
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                resolve(type === 'prompt' ? null : false)
                document.body.removeChild(backdrop)
                document.removeEventListener('keydown', escHandler)
            }
        }
        document.addEventListener('keydown', escHandler)

        // Enter 键确认
        if (type === 'prompt') {
            const input = document.getElementById('dialog-input')
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        resolve(input.value)
                        document.body.removeChild(backdrop)
                        document.removeEventListener('keydown', escHandler)
                    }
                })
            }
        }
    })
}

// 便捷方法
async function customAlert(message, title = '提示') {
    return await showDialog({ title, message, type: 'alert' })
}

async function customConfirm(message, title = '确认') {
    return await showDialog({ title, message, type: 'confirm' })
}

async function customPrompt(message, defaultValue = '', placeholder = '', inputType = 'text', title = '输入') {
    return await showDialog({ title, message, type: 'prompt', defaultValue, placeholder, inputType })
}

// 多语言
const i18n = {
    zh: {
        'nav.home': '首页', 'nav.categories': '博客', 'nav.board': '留言板',
        'home.title': '关于我', 'home.contact': '联系方式',
        'categories.title': '分类', 'board.title': '留言板',
        'board.placeholder': '请输入留言', 'board.nick': '请输入昵称',
        'board.pwd': '请输入密码(用于删除留言)', 'board.post': '发布',
        'board.welcome': '欢迎来到留言板！',
        'board.welcomeDesc': '在这里分享您的想法、建议或问候吧～',
        'board.pwdHint': '💡 提示：设置密码后可以删除自己发布的留言',
        'post.edit': '编辑', 'post.delete': '删除', 'post.publish': '发布文章',
        'post.all': '全部', 'post.cover': '封面URL', 'post.localCover': '本地封面',
        'post.title': '标题', 'post.desc': '简介', 'post.category': '分类',
        'post.syncGithub': '同步GitHub', 'post.syncToRepo': '发布到 GitHub 仓库',
        'post.githubToken': 'GitHub Token', 'post.password': '密码',
        'post.editContent': '编辑正文', 'post.cancel': '取消', 'post.save': '保存',
        'post.settings': '设置', 'post.deleteArticle': '删除文章',
        'post.saveAndSync': '保存并同步', 'post.noContent': '暂无内容',
        'post.loading': '正在从远端加载文章内容……', 'post.loadFailed': '加载失败'
    },
    en: {
        'nav.home': 'Home', 'nav.categories': 'Categories', 'nav.board': 'Board',
        'home.title': 'About Me', 'home.contact': 'Contact',
        'categories.title': 'Categories', 'board.title': 'Message Board',
        'board.placeholder': 'Please enter a message', 'board.nick': 'Please enter a nickname',
        'board.pwd': 'Enter password (for deletion)', 'board.post': 'Post',
        'board.welcome': 'Welcome to the Message Board!',
        'board.welcomeDesc': 'Share your thoughts, suggestions, or greetings here~',
        'board.pwdHint': '💡 Tip: Set a password to delete your own messages',
        'post.edit': 'Edit', 'post.delete': 'Delete', 'post.publish': 'Publish Article',
        'post.all': 'All', 'post.cover': 'Cover URL', 'post.localCover': 'Local Cover',
        'post.title': 'Title', 'post.desc': 'Description', 'post.category': 'Category',
        'post.syncGithub': 'Sync GitHub', 'post.syncToRepo': 'Publish to GitHub Repository',
        'post.githubToken': 'GitHub Token', 'post.password': 'Password',
        'post.editContent': 'Edit Content', 'post.cancel': 'Cancel', 'post.save': 'Save',
        'post.settings': 'Settings', 'post.deleteArticle': 'Delete Article',
        'post.saveAndSync': 'Save & Sync', 'post.noContent': 'No content',
        'post.loading': 'Loading content from remote...', 'post.loadFailed': 'Load failed'
    }
}

let currentLang = 'zh'
function t(key) { return (i18n[currentLang] && i18n[currentLang][key]) || key }
function setBackground() {
    if (BG_IMAGE && BG_IMAGE.trim()) {
        document.documentElement.style.setProperty('--bg-url', `url('${BG_IMAGE}')`)
    }
}


// 数据存储
const MASTER = 'jzh0128'


const sampleArticles = [] // 移除示例文章，避免重复添加



// 同步状态
let isSyncing = false
let lastSyncTime = 0
let syncInterval = null
const SYNC_TIMEOUT = 10000 // 同步超时时间：10秒
let dataRecordId = null // Supabase 数据记录 ID

// 获取 GitHub Token（仅用于文章内容存储）
function getGitHubToken() {
    return localStorage.getItem(GITHUB_TOKEN_KEY) || ''
}

// 设置 GitHub Token
function setGitHubToken(token) {
    if (token && token.trim()) {
        localStorage.setItem(GITHUB_TOKEN_KEY, token.trim())
    } else {
        localStorage.removeItem(GITHUB_TOKEN_KEY)
    }
}

// ==================== Supabase 数据存储同步 ====================

// 从 Supabase 读取数据（带超时控制和详细错误日志）
async function pullDataFromCloud() {
    try {
        console.log('📥 开始拉取云端数据...')
        console.log('Supabase URL:', SUPABASE_URL)
        console.log('Table Name:', SUPABASE_TABLE_NAME)
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), SYNC_TIMEOUT)
        
        // 查询数据（获取第一条记录，按 ID 倒序）
        const url = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE_NAME}?select=*&order=id.desc&limit=1`
        const headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
        }
        
        console.log('请求 URL:', url)
        
        const res = await fetch(url, { 
            headers,
            cache: 'no-store',
            signal: controller.signal
        })
        
        clearTimeout(timeoutId)
        
        console.log('响应状态:', res.status, res.statusText)
        
        if (!res.ok) {
            const errorText = await res.text()
            console.error('❌ 拉取失败:', errorText)
            throw new Error(`拉取失败 (${res.status}): ${errorText}`)
        }
        
        const result = await res.json()
        console.log('✅ 拉取成功，记录数:', result.length)
        
        if (!result || result.length === 0) {
            console.log('⚠️ 云端无数据，将在首次推送时创建')
            return null
        }
        
        const data = result[0]
        dataRecordId = data.id // 保存记录 ID 用于更新
        localStorage.setItem('supabase_record_id', dataRecordId)
        console.log('📌 记录 ID:', dataRecordId)
        
        // 优化：文章元数据不包含 content，减少存储空间
        const posts = (data.posts || []).map(p => ({
            ...p,
            content: p.content || '' // 内容从 GitHub 加载
        }))
        
        console.log('📄 文章数:', posts.length, '💬 留言数:', (data.messages || []).length)
        
        return {
            posts: posts,
            messages: data.messages || [],
            lastModified: data.last_modified || Date.now()
        }
    } catch (e) {
        if (e.name === 'AbortError') {
            console.error('⏱️ 拉取超时')
            throw new Error('同步超时（10秒），请检查网络连接')
        }
        console.error('❌ 拉取错误:', e)
        throw e
    }
}

// 推送数据到 Supabase（带超时控制和详细错误日志）
async function pushDataToCloud(posts, messages) {
    try {
        console.log('📤 开始推送数据到云端...')
        
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), SYNC_TIMEOUT)

        // 优化：只存储文章元数据，不存储完整内容（节省空间）
        const optimizedPosts = posts.map(p => {
            const meta = {
                id: p.id,
                type: p.type,
                title: p.title,
                desc: p.desc,
                category: p.category,
                cover: p.cover,
                repoPath: p.repoPath,
                repoSha: p.repoSha,
                lastModified: p.lastModified || Date.now()
            }

            // 如果文章没有 repoPath（未上传到 GitHub），则保留 content
            if (!p.repoPath && p.content) {
                meta.content = p.content
            }

            return meta
        })

        const data = {
            posts: optimizedPosts,
            messages: messages,
            last_modified: Date.now(),
            version: APP_VERSION
        }
        
        console.log('📊 数据统计 - 文章:', optimizedPosts.length, '留言:', messages.length)

        const headers = {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }

        let url, method
        if (dataRecordId) {
            // 更新现有数据
            url = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE_NAME}?id=eq.${dataRecordId}`
            method = 'PATCH'
            console.log('🔄 更新现有记录 ID:', dataRecordId)
        } else {
            // 创建新数据
            url = `${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE_NAME}`
            method = 'POST'
            console.log('➕ 创建新记录')
        }
        
        console.log('请求方法:', method)
        console.log('请求 URL:', url)

        const res = await fetch(url, {
            method: method,
            headers: headers,
            body: JSON.stringify(data),
            signal: controller.signal
        })

        clearTimeout(timeoutId)
        
        console.log('响应状态:', res.status, res.statusText)

        if (!res.ok) {
            const errorText = await res.text()
            console.error('❌ 推送失败:', errorText)
            throw new Error(`推送失败 (${res.status}): ${errorText}`)
        }

        const result = await res.json()
        console.log('✅ 推送成功，返回数据:', result)
        
        if (!dataRecordId && result && result.length > 0 && result[0].id) {
            dataRecordId = result[0].id // 保存新创建的记录 ID
            localStorage.setItem('supabase_record_id', dataRecordId)
            console.log('📌 保存新记录 ID:', dataRecordId)
        }

        localStorage.setItem('last_sync_time', Date.now().toString())
        console.log('✅ 同步完成！')
        return true
    } catch (e) {
        if (e.name === 'AbortError') {
            console.error('⏱️ 推送超时')
            throw new Error('同步超时（10秒），请检查网络连接')
        }
        console.error('❌ 推送错误:', e)
        throw e
    }
}

// 同步数据（智能合并本地和云端，优先本地数据）
async function syncData(pushOnly = false) {
    if (isSyncing) {
        console.log('Sync already in progress')
        throw new Error('同步正在进行中，请稍候')
    }

    isSyncing = true

    try {
        // 获取本地数据
        const localPosts = getPosts()
        const localMessages = getMessages()
        
        // 如果是仅推送模式（删除操作），直接推送本地数据
        if (pushOnly) {
            await pushDataToCloud(localPosts, localMessages)
            lastSyncTime = Date.now()
            return true
        }

        // 拉取云端数据
        const remoteData = await pullDataFromCloud()

        let finalPosts = localPosts
        let finalMessages = localMessages
        let needPush = false

        if (remoteData) {
            // 合并文章数据（优先使用本地数据，除非云端有更新的版本）
            const postsMap = new Map()

            // 先添加本地数据
            localPosts.forEach(p => postsMap.set(p.id, p))

            // 再检查远程数据，只添加本地没有的或更新的
            remoteData.posts.forEach(p => {
                const existing = postsMap.get(p.id)
                if (!existing) {
                    // 本地没有，添加远程数据
                    postsMap.set(p.id, p)
                } else if (p.lastModified && existing.lastModified && p.lastModified > existing.lastModified) {
                    // 远程更新，使用远程数据
                    postsMap.set(p.id, p)
                }
            })

            finalPosts = Array.from(postsMap.values())

            // 合并留言数据（按时间戳去重）
            const messagesMap = new Map()
            localMessages.forEach(m => messagesMap.set(m.t, m))
            remoteData.messages.forEach(m => {
                if (!messagesMap.has(m.t)) {
                    messagesMap.set(m.t, m)
                }
            })
            finalMessages = Array.from(messagesMap.values()).sort((a, b) => b.t - a.t)

            // 检查是否需要推送
            needPush = finalPosts.length !== remoteData.posts.length ||
                finalMessages.length !== remoteData.messages.length ||
                JSON.stringify(finalPosts.map(p => p.id).sort()) !== JSON.stringify(remoteData.posts.map(p => p.id).sort()) ||
                JSON.stringify(finalMessages.map(m => m.t).sort()) !== JSON.stringify(remoteData.messages.map(m => m.t).sort())

            // 保存合并后的数据到本地
            localStorage.setItem('myblog_posts', JSON.stringify(finalPosts))
            localStorage.setItem('myblog_msgs', JSON.stringify(finalMessages))

            // 如果有新数据，推送到云端
            if (needPush) {
                console.log('🔄 检测到数据变化，推送到云端')
                await pushDataToCloud(finalPosts, finalMessages)
            }
        } else {
            // 远程没有数据，直接推送本地数据
            await pushDataToCloud(finalPosts, finalMessages)
        }

        lastSyncTime = Date.now()
        return true
    } catch (e) {
        console.error('Sync error:', e)
        throw e
    } finally {
        isSyncing = false
    }
}

// 显示通知（简化版）
function showNotification(message, type = 'info') {
    const existing = document.getElementById('sync-status')
    if (existing) existing.remove()

    const status = document.createElement('div')
    status.id = 'sync-status'
    status.className = `sync-status sync-${type}`
    status.textContent = message
    document.body.appendChild(status)

    setTimeout(() => {
        status.classList.add('show')
    }, 10)

    setTimeout(() => {
        status.classList.remove('show')
        setTimeout(() => status.remove(), 300)
    }, 3000)
}



function getPosts() {
    const raw = localStorage.getItem('myblog_posts')
    if (!raw) {
        localStorage.setItem('myblog_posts', JSON.stringify(sampleArticles))
        return sampleArticles.slice()
    }
    try { return JSON.parse(raw) } catch (e) { return sampleArticles.slice() }
}

function savePosts(posts) {
    localStorage.setItem('myblog_posts', JSON.stringify(posts))
}

function getMessages() {
    const raw = localStorage.getItem('myblog_msgs')
    try { return raw ? JSON.parse(raw) : [] } catch (e) { return [] }
}

function saveMessages(messages) {
    localStorage.setItem('myblog_msgs', JSON.stringify(messages))
}

const categories = ['随笔', '编程技术', '算法', '计算机知识', '英语', '数学']

// GitHub API
const GITHUB_API_BASE = 'https://api.github.com'
const REPO_OWNER = 'aurorarain'
const REPO_NAME = 'my_blog_web_storage'
const REPO_BRANCH = 'main'
const REPO_PATH_MAP = {
    '随笔': 'Essay',
    '编程技术': 'Coding',
    '算法': 'Algorithm',
    '计算机知识': 'CSKnowledge',
    '英语': 'English',
    '数学': 'Math'
}

function toBase64(str) { return btoa(unescape(encodeURIComponent(str))) }
function arrayBufferToBase64(buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i])
    return btoa(binary)
}

async function uploadContentToRepo(targetPath, base64Content, token, message = 'Update content') {
    const fileUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${targetPath}`
    const headers = { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' }

    let sha = null
    try {
        const resCheck = await fetch(fileUrl, { headers })
        if (resCheck.ok) {
            const d = await resCheck.json()
            sha = d.sha
        }
    } catch (e) { console.warn('check exist error', e) }

    const body = { message, content: base64Content, branch: REPO_BRANCH }
    if (sha) body.sha = sha

    const res = await fetch(fileUrl, { method: 'PUT', headers, body: JSON.stringify(body) })
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error('文件上传失败: ' + res.status + ' ' + text)
    }
    const j = await res.json()
    return { sha: j.content && j.content.sha, path: j.content && j.content.path }
}

async function fetchRawFile(path) {
    if (!path) return null
    try {
        const url = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${path}`
        const res = await fetch(url)
        if (!res.ok) throw new Error('fetch failed ' + res.status)
        return await res.text()
    } catch (e) {
        console.warn('fetchRawFile error', e)
        return null
    }
}

// 自定义图片缩放功能（支持自由缩放）
function makeImageResizable(img) {
    if (img.dataset.resizable) return
    img.dataset.resizable = 'true'
    img.style.cursor = 'nwse-resize'
    img.style.maxWidth = '100%'

    let isResizing = false
    let startX, startY, startWidth, startHeight

    img.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return
        e.preventDefault()
        isResizing = true
        startX = e.clientX
        startY = e.clientY
        startWidth = img.offsetWidth
        startHeight = img.offsetHeight

        document.body.style.cursor = 'nwse-resize'
        document.body.style.userSelect = 'none'
    })

    document.addEventListener('mousemove', function (e) {
        if (!isResizing) return
        e.preventDefault()

        const deltaX = e.clientX - startX
        const deltaY = e.clientY - startY

        // 自由缩放（非等比例）
        const newWidth = Math.max(50, startWidth + deltaX)
        const newHeight = Math.max(50, startHeight + deltaY)

        img.style.width = newWidth + 'px'
        img.style.height = newHeight + 'px'
        img.style.maxWidth = 'none'
    })

    document.addEventListener('mouseup', function () {
        if (isResizing) {
            isResizing = false
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }
    })
}

async function uploadFileToRepo(post, token) {
    const folder = REPO_PATH_MAP[post.category] || REPO_PATH_MAP['随笔'] || ''
    const filename = (post.title || 'post').replace(/[^a-z0-9]/ig, '_') + '.html'
    const targetPath = folder ? `${folder}/${filename}` : filename

    // 提取并上传内联图片
    let content = post.content || ''
    const imgRegex = /<img[^>]+src="data:image\/([^;]+);base64,([^"]+)"[^>]*>/g
    let match
    const uploadPromises = []
    let imageCounter = 1

    while ((match = imgRegex.exec(content)) !== null) {
        const fullMatch = match[0]
        const imageType = match[1]
        const base64Data = match[2]

        // 使用文章标题和序号作为图片名称
        const safeTitle = (post.title || 'post').replace(/[^a-z0-9]/ig, '_').substring(0, 30)
        const imageName = `${safeTitle}_img${imageCounter}.${imageType.replace('jpeg', 'jpg')}`
        const imagePath = `${folder}/${imageName}`

        uploadPromises.push(
            uploadContentToRepo(imagePath, base64Data, token, `Upload image ${imageName}`)
                .then(res => {
                    const imageUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${imagePath}`
                    content = content.replace(fullMatch, fullMatch.replace(`data:image/${imageType};base64,${base64Data}`, imageUrl))
                })
                .catch(err => {
                    console.error('Failed to upload image:', err)
                })
        )

        imageCounter++
    }

    await Promise.all(uploadPromises)

    const contentBase64 = toBase64(content)
    const result = await uploadContentToRepo(targetPath, contentBase64, token, `Update post: ${post.title}`)

    // 更新文章的 lastModified 时间戳
    post.lastModified = Date.now()

    return result
}

// 从 GitHub 删除单个文件
async function deleteSingleFileFromRepo(filePath, token, message = 'Delete file') {
    const fileUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`
    const headers = { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' }

    const res = await fetch(fileUrl, { headers })
    if (!res.ok) {
        console.warn(`文件不存在或无法访问: ${filePath}`)
        return false
    }
    const data = await res.json()

    const body = { message, sha: data.sha, branch: REPO_BRANCH }
    const deleteRes = await fetch(fileUrl, { method: 'DELETE', headers, body: JSON.stringify(body) })
    if (!deleteRes.ok) {
        console.warn(`文件删除失败: ${filePath}`)
        return false
    }
    return true
}

// 删除文章及其所有相关文件（封面、内容图片）
async function deleteFileFromRepo(post, token) {
    const folder = REPO_PATH_MAP[post.category] || 'Essay'
    const safeTitle = (post.title || 'post').replace(/[^a-z0-9]/ig, '_').substring(0, 30)

    const deletePromises = []

    // 1. 删除文章 HTML 文件
    const htmlPath = post.repoPath || `${folder}/${safeTitle}.html`
    deletePromises.push(deleteSingleFileFromRepo(htmlPath, token, `Delete post: ${post.title}`))

    // 2. 删除封面图片（尝试常见格式）
    const coverExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    for (const ext of coverExtensions) {
        const coverPath = `${folder}/${safeTitle}_cover.${ext}`
        deletePromises.push(deleteSingleFileFromRepo(coverPath, token, `Delete cover: ${post.title}`))
    }

    // 3. 删除内容图片（尝试删除 img1-img20）
    for (let i = 1; i <= 20; i++) {
        for (const ext of ['jpg', 'jpeg', 'png', 'gif', 'webp']) {
            const imgPath = `${folder}/${safeTitle}_img${i}.${ext}`
            deletePromises.push(deleteSingleFileFromRepo(imgPath, token, `Delete image: ${post.title}`))
        }
    }

    // 并发删除所有文件
    const results = await Promise.allSettled(deletePromises)
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value === true).length

    console.log(`删除完成: ${successCount} 个文件被删除`)
    return successCount > 0
}

// 富文本编辑器页面
async function renderEditPage(id) {
    const post = getPosts().find(p => p.id == id)
    if (!post) {
        await customAlert('文章未找到')
        return
    }

    // 获取保存的 GitHub Token
    const savedToken = getGitHubToken()

    document.getElementById('app').innerHTML = `<section class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h2>编辑正文：${escapeHtml(post.title)}</h2>
            <div style="display:flex;gap:8px">
                <button id="admin-md" title="编辑元数据">⚙️ 设置</button>
                <button id="delete-md" title="删除文章" style="color:#d73a49">🗑️ 删除</button>
            </div>
        </div>
        <div style="display:flex;gap:12px;flex-direction:column">
            <div id="editor-container" style="min-height:400px;background:white;border:1px solid #e6e6e6;border-radius:8px">
                <div style="padding:20px;text-align:center;color:#666">正在加载编辑器...</div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px">
                <input id="edit-token" placeholder="GitHub Token（用于同步）" value="${savedToken}" style="flex:1;min-width:200px;padding:8px;border:1px solid #e6e6e6;border-radius:6px"/>
                <button id="save-md" style="background:#28a745;color:white;border-color:#28a745;padding:8px 16px;border-radius:6px;cursor:pointer">💾 保存并同步到 GitHub</button>
                <button id="cancel-md" style="padding:8px 16px;border-radius:6px;cursor:pointer">❌ 取消</button>
            </div>
            <div style="padding:12px;background:#e3f2fd;border-radius:6px;font-size:13px;color:#1565c0">
                💡 <strong>提示</strong>：输入 GitHub Token 后，文章内容和图片会自动上传到 GitHub，节省Supabase空间，支持更多文章。
            </div>
        </div>
    </section>`

    let quill = null

    // 动态加载 Quill
    try {
        await window.loadQuill()

        quill = new Quill('#editor-container', {
            theme: 'snow',
            placeholder: '开始编写您的文章内容...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'font': [] }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'script': 'sub' }, { 'script': 'super' }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'indent': '-1' }, { 'indent': '+1' }],
                    [{ 'align': [] }],
                    ['blockquote', 'code-block'],
                    ['link', 'image', 'video'],
                    ['clean']
                ]
            }
        })

        // 添加自定义图片缩放功能（自由缩放，非等比例）
        const images = quill.root.querySelectorAll('img')
        images.forEach(img => makeImageResizable(img))

        quill.on('text-change', function () {
            const newImages = quill.root.querySelectorAll('img:not([data-resizable])')
            newImages.forEach(img => makeImageResizable(img))
        })

        if (post.content) {
            quill.root.innerHTML = post.content
        }
    } catch (e) {
        console.error('Quill init failed', e)
        await customAlert('编辑器加载失败，请刷新页面重试')
        return
    }

    if ((!post.content || post.content.trim() === '') && post.repoPath) {
        fetchRawFile(post.repoPath).then(txt => {
            if (txt && quill) {
                quill.root.innerHTML = txt
                const posts = getPosts()
                const idx = posts.findIndex(p => p.id == id)
                if (idx !== -1) {
                    posts[idx].content = txt
                    savePosts(posts)
                }
            }
        }).catch(e => {
            console.error('Failed to fetch remote content:', e)
        })
    }

    document.getElementById('save-md').addEventListener('click', async () => {
        if (!quill) {
            await customAlert('编辑器未初始化')
            return
        }

        const htmlContent = quill.root.innerHTML
        const token = document.getElementById('edit-token').value.trim()
        const posts = getPosts()
        const idx = posts.findIndex(p => p.id == id)

        if (idx === -1) {
            await customAlert('文章未找到')
            return
        }

        // 更新文章内容和时间戳
        posts[idx].content = htmlContent
        posts[idx].lastModified = Date.now()

        if (token) {
            try {
                // 上传文章内容到 GitHub（包括内联图片）
                const res = await uploadFileToRepo(posts[idx], token)
                posts[idx].repoSha = res.sha
                posts[idx].repoPath = res.path

                // 清空本地 content，节省 JSONBin 空间
                const localContent = posts[idx].content
                posts[idx].content = '' // 内容已在 GitHub，本地不存

                savePosts(posts)

                // 同步到云端（仅推送模式）
                try {
                    await syncData(true)
                    // 恢复 content 到内存（用于立即显示）
                    posts[idx].content = localContent
                    showNotification('✅ 文章保存成功！', 'success')
                    location.hash = 'post-' + id
                } catch (syncErr) {
                    // 云端同步失败，但 GitHub 已成功
                    posts[idx].content = localContent
                    await customAlert('⚠️ 文章已保存到 GitHub，但云端同步失败：' + syncErr.message + '\n\n其他设备可能无法立即看到更新', '部分成功')
                    location.hash = 'post-' + id
                }
            } catch (e) {
                // GitHub 同步失败
                await customAlert('❌ GitHub 同步失败：' + e.message + '\n\n请检查 Token 权限和网络连接', '同步失败')
                console.error('GitHub sync error:', e)
            }
        } else {
            // 没有 Token，保存到本地并同步到云端
            savePosts(posts)
            try {
                await syncData(false)
                showNotification('✅ 文章保存成功！', 'success')
                location.hash = 'post-' + id
            } catch (e) {
                await customAlert('❌ 文章保存失败：' + e.message + '\n\n请检查网络连接后重试', '保存失败')
            }
        }
    })

    document.getElementById('cancel-md').addEventListener('click', () => {
        location.hash = 'post-' + id
    })

    document.getElementById('admin-md').addEventListener('click', () => {
        openEditor({ mode: 'edit', post })
    })

    document.getElementById('delete-md').addEventListener('click', async () => {
        const confirmed = await customConfirm('⚠️ 确定要删除这篇文章吗？\n\n此操作不可恢复！', '确认删除')
        if (!confirmed) return

        const token = document.getElementById('edit-token').value.trim()
        const posts = getPosts()
        const idx = posts.findIndex(p => p.id == id)

        if (idx === -1) {
            await customAlert('文章未找到')
            return
        }

        // 保存删除前的数据（用于回滚）
        const deletedPost = posts[idx]

        // 如果文章已同步到 GitHub 且提供了 Token，则从远程删除
        if (post.repoPath && token) {
            try {
                await deleteFileFromRepo(posts[idx], token)
                posts.splice(idx, 1)
                savePosts(posts)
                
                // 同步到云端
                try {
                    await syncData(false)
                    showNotification('✅ 文章删除成功！', 'success')
                    location.hash = 'categories'
                } catch (syncErr) {
                    // 云端同步失败，回滚
                    posts.splice(idx, 0, deletedPost)
                    savePosts(posts)
                    await customAlert('❌ 云端同步失败：' + syncErr.message + '\n\n文章删除已回滚', '同步失败')
                }
            } catch (e) {
                const confirmLocal = await customConfirm('❌ GitHub 删除失败：' + e.message + '\n\n是否仅删除本地文章？', 'GitHub 删除失败')
                if (confirmLocal) {
                    posts.splice(idx, 1)
                    savePosts(posts)
                    
                    // 同步到云端（仅推送模式）
                    try {
                        await syncData(true)
                        showNotification('✅ 本地文章删除成功！', 'success')
                        location.hash = 'categories'
                    } catch (syncErr) {
                        // 云端同步失败，回滚
                        posts.splice(idx, 0, deletedPost)
                        savePosts(posts)
                        await customAlert('❌ 云端同步失败：' + syncErr.message + '\n\n文章删除已回滚', '同步失败')
                    }
                } else {
                    return
                }
            }
        } else {
            posts.splice(idx, 1)
            savePosts(posts)
            
            // 同步到云端（仅推送模式）
            try {
                await syncData(true)
                showNotification('✅ 文章删除成功！', 'success')
                location.hash = 'categories'
            } catch (e) {
                // 云端同步失败，回滚
                posts.splice(idx, 0, deletedPost)
                savePosts(posts)
                await customAlert('❌ 文章删除失败：' + e.message + '\n\n请检查网络连接后重试', '删除失败')
            }
        }
    })
}

function renderPostDetail(id) {
    const p = getPosts().find(x => x.id == id) || { title: '未找到', desc: '', content: '' }

    const renderedContent = p.content || `<p>${t('post.noContent')}</p>`

    document.getElementById('app').innerHTML = `<section class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
            <h2 class="pd-title">${escapeHtml(p.title)}</h2>
            <div><button id="jump-edit" style="padding:6px 12px;border-radius:6px;cursor:pointer">${t('post.edit')}</button></div>
        </div>
        <p class="pd-desc">${escapeHtml(p.desc)}</p>
        <hr/>
        <div class="pd-content ql-editor">${renderedContent}</div>
    </section>`

    const jumpBtn = document.getElementById('jump-edit')
    if (jumpBtn) {
        jumpBtn.addEventListener('click', () => { location.hash = 'edit-' + id })
    }

    if ((!p.content || p.content.trim() === '') && p.repoPath) {
        const contentEl = document.querySelector('.pd-content')
        if (contentEl) {
            contentEl.innerHTML = `<p>${t('post.loading')}</p>`
            fetchRawFile(p.repoPath).then(txt => {
                if (txt) {
                    p.content = txt
                    const posts = getPosts()
                    const idx = posts.findIndex(x => x.id == id)
                    if (idx !== -1) {
                        posts[idx].content = txt
                        savePosts(posts)
                    }
                    contentEl.innerHTML = txt
                } else {
                    contentEl.innerHTML = `<p>${t('post.loadFailed')}</p>`
                }
            }).catch(e => {
                console.error('Failed to fetch remote content:', e)
                contentEl.innerHTML = `<p>${t('post.loadFailed')}</p>`
            })
        }
    }
}

// 路由
const router = debounce(function () {
    const hash = location.hash.replace('#', '') || 'home'
    if (hash.startsWith('edit-')) return renderEditPage(hash.replace('edit-', ''))
    if (hash.startsWith('post-')) return renderPostDetail(hash.replace('post-', ''))
    if (hash.startsWith('categories-')) return renderCategories(document.getElementById('app'), decodeURIComponent(hash.replace('categories-', '')))
    renderPage(hash)
}, 100)

function renderPage(page) {
    const app = document.getElementById('app')
    if (page === 'home') renderHome(app)
    else if (page === 'categories') renderCategories(app)
    else if (page === 'board') renderBoard(app)
    else renderHome(app)
}

function renderHome(root) {
    const name = currentLang === 'zh' ? USER_NAME_ZH : USER_NAME_EN
    const bio = currentLang === 'zh' ? USER_BIO_ZH : USER_BIO_EN
    root.innerHTML = `
        <section class="card home-grid">
            <img class="avatar" src="${USER_PHOTO || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23ddd%22 width=%22400%22 height=%22400%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2224%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3E%E5%A4%B4%E5%83%8F%3C/text%3E%3C/svg%3E'}" alt="avatar">
            <div>
                <h2>${name}</h2>
                <p>${bio}</p>
                <h3>${t('home.contact')}</h3>
                <div class="contact-list">
                    ${USER_CONTACT.map(c => `<div class="contact-item"><strong>${c.type}:</strong><span>${c.value}</span></div>`).join('')}
                </div>
            </div>
        </section>
    `
}

function renderCategories(root, selectedCat) {
    root.innerHTML = `<section class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
            <h2>${t('categories.title')}</h2>
            <div style="display:flex;gap:8px;align-items:center">
                <button id="addArticleBtn">${t('post.publish')}</button>
            </div>
        </div>
        <div class="categories">
                <button class="cat-btn" data-cat="all">${t('post.all')}</button>
                ${categories.map(c => {
        const label = currentLang === 'zh' ? c : (REPO_PATH_MAP[c] || c)
        return `<button class="cat-btn" data-cat="${c}">${label}</button>`
    }).join('')}
            </div>
        <div id="posts" class="posts-grid"></div>
    </section>`

    // 使用事件委托优化分类按钮点击
    const categoriesEl = root.querySelector('.categories')
    if (categoriesEl) {
        categoriesEl.addEventListener('click', function (e) {
            if (e.target.classList.contains('cat-btn')) {
                const catKey = e.target.dataset.cat
                location.hash = 'categories-' + encodeURIComponent(catKey)
            }
        })
    }

    const addBtn = document.getElementById('addArticleBtn')
    if (addBtn) {
        addBtn.addEventListener('click', () => openEditor({ mode: 'create', type: 'article' }))
    }

    if (selectedCat) renderPostsForCategory(selectedCat)
    else renderPostsForCategory('all')
}

function renderPostsForCategory(cat) {
    let posts
    if (cat === 'all') {
        posts = getPosts().filter(p => p.type === 'article')
    } else {
        posts = getPosts().filter(p => p.type === 'article' && p.category === cat)
    }
    const el = document.getElementById('posts')
    if (!el) return

    // 移除旧的事件监听器
    const oldHandler = el._clickHandler
    if (oldHandler) {
        el.removeEventListener('click', oldHandler)
    }

    // 使用 DocumentFragment 减少 DOM 重绘
    const fragment = document.createDocumentFragment()
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = posts.map(p => `<div class="post card" data-id="${p.id}">
        <img src="${p.cover || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22320%22 height=%22180%22%3E%3Crect fill=%22%23ddd%22 width=%22320%22 height=%22180%22/%3E%3Ctext fill=%22%23999%22 font-family=%22sans-serif%22 font-size=%2218%22 dy=%2210.5%22 font-weight=%22bold%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22%3E%E6%97%A0%E5%B0%81%E9%9D%A2%3C/text%3E%3C/svg%3E'}" alt="${escapeHtml(p.title)}" loading="lazy" onload="this.classList.add('loaded')">
        <div>
            <h4 class="post-title">${escapeHtml(p.title)}</h4>
            <p class="post-desc">${escapeHtml(p.desc)}</p>
        </div>
        <div style="margin-left:auto">
            <button class="edit-post" data-id="${p.id}">${t('post.edit')}</button>
            <button class="del-post" data-id="${p.id}">${t('post.delete')}</button>
        </div>
    </div>`).join('')

    while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild)
    }

    el.innerHTML = ''
    el.appendChild(fragment)

    // 使用事件委托减少事件监听器数量
    const clickHandler = function (e) {
        const target = e.target
        const card = target.closest('.post')

        if (target.classList.contains('edit-post')) {
            e.stopPropagation()
            const id = +target.dataset.id
            const post = getPosts().find(p => p.id === id)
            openEditor({ mode: 'edit', post })
        } else if (target.classList.contains('del-post')) {
            e.stopPropagation()
            const id = +target.dataset.id
            deletePost(id)
        } else if (card) {
            const id = card.dataset.id
            location.hash = 'post-' + id
        }
    }

    el._clickHandler = clickHandler
    el.addEventListener('click', clickHandler)
}

function renderBoard(root) {
    root.innerHTML = `<section class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h2>${t('board.title')}</h2>
        </div>
        <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin-bottom:16px;border-left:4px solid #0969da">
            <div style="font-size:18px;font-weight:600;margin-bottom:8px">${t('board.welcome')}</div>
            <div style="color:#666;margin-bottom:8px">${t('board.welcomeDesc')}</div>
            <div style="color:#888;font-size:13px">${t('board.pwdHint')}</div>
        </div>
        <div class="board-form">
            <input id="nick" placeholder="${t('board.nick')}" />
            <input id="pwd" placeholder="${t('board.pwd')}" type="password" style="width:180px;" />
            <input id="msg" placeholder="${t('board.placeholder')}" style="flex:1;" />
            <button id="postBtn">${t('board.post')}</button>
        </div>
        <div id="messages" class="board-list"></div>
    </section>`

    document.getElementById('postBtn').addEventListener('click', postMessage)
    loadMessages()
}

function loadMessages() {
    const msgs = getMessages()
    const box = document.getElementById('messages')

    if (!box) return // 防止在页面切换时出错

    // 使用 DocumentFragment 优化 DOM 操作
    const fragment = document.createDocumentFragment()
    const tempDiv = document.createElement('div')

    // 格式化时间显示
    const formatTime = (timestamp) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return currentLang === 'zh' ? '刚刚' : 'Just now'
        if (minutes < 60) return currentLang === 'zh' ? `${minutes}分钟前` : `${minutes}m ago`
        if (hours < 24) return currentLang === 'zh' ? `${hours}小时前` : `${hours}h ago`
        if (days < 7) return currentLang === 'zh' ? `${days}天前` : `${days}d ago`
        return date.toLocaleString(currentLang === 'zh' ? 'zh-CN' : 'en-US')
    }

    tempDiv.innerHTML = msgs.map((m, idx) => `<div class="message">
        <div>
            <strong>${escapeHtml(m.nick || '访客')}</strong> 
            <small>${formatTime(m.t)}</small> 
            <button data-idx="${idx}" class="del-btn">${currentLang === 'zh' ? '删除' : 'Delete'}</button>
        </div>
        <div>${escapeHtml(m.text)}</div>
    </div>`).join('')

    while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild)
    }

    box.innerHTML = ''
    box.appendChild(fragment)

    // 移除旧的事件监听器（如果存在）
    const oldHandler = box._deleteHandler
    if (oldHandler) {
        box.removeEventListener('click', oldHandler)
    }

    // 创建新的事件处理器并保存引用
    const deleteHandler = function (e) {
        if (e.target.classList.contains('del-btn')) {
            const idx = +e.target.dataset.idx
            tryDelete(idx)
        }
    }

    box._deleteHandler = deleteHandler
    box.addEventListener('click', deleteHandler)
}

async function postMessage() {
    const nickRaw = document.getElementById('nick').value.trim()
    const nick = nickRaw || '访客'
    const pwd = document.getElementById('pwd').value || ''
    const text = document.getElementById('msg').value.trim()
    if (!text) {
        await customAlert('请输入内容')
        return
    }

    const msgs = getMessages()

    if (nick !== '访客') {
        const exists = msgs.some(m => (m.nick || '').toLowerCase() === nick.toLowerCase())
        if (exists) {
            await customAlert('昵称已存在，请换一个昵称')
            return
        }
        if (!pwd.trim()) {
            await customAlert('请输入密码用于将来删除留言')
            return
        }
    }

    msgs.unshift({ nick, text, t: Date.now(), pwd: pwd })
    saveMessages(msgs)

    // 同步到云端
    try {
        await syncData(false)
        document.getElementById('msg').value = ''
        document.getElementById('pwd').value = ''
        loadMessages()
        showNotification('✅ 留言发布成功！', 'success')
    } catch (e) {
        // 同步失败，回滚
        msgs.shift()
        saveMessages(msgs)
        await customAlert('❌ 留言发布失败：' + e.message + '\n\n请检查网络连接后重试', '发布失败')
    }
}

async function tryDelete(idx) {
    const msgs = getMessages()
    const m = msgs[idx]
    if (!m) {
        await customAlert('留言不存在')
        return
    }
    const input = await customPrompt('请输入删除密码：', '', '输入密码', 'password', '删除留言')
    if (input === null) return
    if (input === MASTER || (m.pwd && input === m.pwd)) {
        const deletedMsg = msgs.splice(idx, 1)[0]
        saveMessages(msgs)

        // 同步到云端（仅推送模式）
        try {
            await syncData(true)
            loadMessages()
            showNotification('✅ 留言删除成功！', 'success')
        } catch (e) {
            // 同步失败，回滚
            msgs.splice(idx, 0, deletedMsg)
            saveMessages(msgs)
            loadMessages()
            await customAlert('❌ 留言删除失败：' + e.message + '\n\n请检查网络连接后重试', '删除失败')
        }
        return
    }
    await customAlert('密码错误，无法删除', '错误')
}

function openEditor({ mode = 'create', type = 'article', post = null } = {}) {
    const backdrop = document.createElement('div')
    backdrop.className = 'modal-backdrop'
    const modal = document.createElement('div')
    modal.className = 'modal'
    modal.innerHTML = `
        <div><strong>${mode === 'create' ? '发布文章' : '编辑文章'}</strong></div>
        <div class="row"><label>封面URL</label><input id="ed-cover" type="url" placeholder="封面图片地址 (可选)"></div>
        <div class="row"><label>本地封面</label><input id="ed-cover-file" type="file" accept="image/*"></div>
        <div class="row"><label>标题</label><input id="ed-title" type="text" placeholder="文章标题"></div>
        <div class="row"><label>简介</label><input id="ed-desc" type="text" placeholder="文章简介"></div>
        <div class="row"><label>分类</label><select id="ed-cat">${categories.map(c => `<option value="${c}">${currentLang === 'zh' ? c : (REPO_PATH_MAP[c] || c)}</option>`).join('')}</select></div>
        <div class="row"><label>同步GitHub</label><label style="flex:1"><input id="ed-remote" type="checkbox"> 发布到 GitHub 仓库</label></div>
        <div class="row"><label>GitHub Token</label><input id="ed-token" type="password" placeholder="GitHub Personal Access Token"></div>
        <div class="row"><label>密码</label><input id="ed-pwd" type="password" placeholder="输入主密码以确认发布/编辑"></div>
        <div class="actions">
            <button id="ed-open-full" style="margin-right:auto">编辑正文</button>
            <button id="ed-cancel">取消</button>
            <button id="ed-save">保存</button>
        </div>
    `
    backdrop.appendChild(modal)
    document.body.appendChild(backdrop)

    const cover = modal.querySelector('#ed-cover')
    const coverFile = modal.querySelector('#ed-cover-file')
    const title = modal.querySelector('#ed-title')
    const desc = modal.querySelector('#ed-desc')
    const cat = modal.querySelector('#ed-cat')
    const pwd = modal.querySelector('#ed-pwd')
    const remoteCheckbox = modal.querySelector('#ed-remote')
    const token = modal.querySelector('#ed-token')

    if (post) {
        cover.value = post.cover || ''
        title.value = post.title || ''
        desc.value = post.desc || ''
        if (post.category) {
            [...cat.options].forEach(o => {
                if (o.value === post.category) o.selected = true
            })
        }
    }

    modal.querySelector('#ed-cancel').addEventListener('click', () => {
        document.body.removeChild(backdrop)
    })

    modal.querySelector('#ed-open-full').addEventListener('click', async () => {
        const provided = pwd.value || ''
        if (provided !== MASTER) {
            await customAlert('密码错误：需要主密码以发布/编辑文章', '密码错误')
            return
        }

        const useRemote = remoteCheckbox.checked
        const tokenVal = token.value.trim()

        if (useRemote && !tokenVal) {
            await customAlert('要同步到 GitHub，请提供 Personal Access Token', '提示')
            return
        }

        if (mode === 'create') {
            const id = Date.now()
            let coverUrl = cover.value.trim()

            // 如果选择了本地封面，先上传
            if (useRemote && coverFile.files && coverFile.files[0]) {
                try {
                    const file = coverFile.files[0]
                    const buffer = await new Promise((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onload = () => resolve(reader.result)
                        reader.onerror = reject
                        reader.readAsArrayBuffer(file)
                    })
                    const base64 = arrayBufferToBase64(buffer)
                    const folder = REPO_PATH_MAP[cat.value] || 'Essay'
                    const safeTitle = (title.value.trim() || 'post').replace(/[^a-z0-9]/ig, '_').substring(0, 30)
                    const ext = file.name.split('.').pop().toLowerCase()
                    const safeName = `${safeTitle}_cover.${ext}`
                    const imagePath = `${folder}/${safeName}`

                    await uploadContentToRepo(imagePath, base64, tokenVal, `Upload cover ${safeName}`)
                    coverUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${imagePath}`
                } catch (err) {
                    await customAlert('封面上传失败：' + err.message, '上传失败')
                    console.error(err)
                    return
                }
            }

            const newPost = {
                id,
                type: 'article',
                cover: coverUrl,
                title: title.value.trim(),
                desc: desc.value.trim(),
                category: cat.value,
                content: '',
                lastModified: Date.now()
            }

            // 如果配置了 GitHub Token，保存 Token 到本地
            if (useRemote && tokenVal) {
                setGitHubToken(tokenVal)
            }

            const posts = getPosts()
            posts.unshift(newPost)
            savePosts(posts)
            document.body.removeChild(backdrop)
            location.hash = 'edit-' + id
        } else {
            const posts = getPosts()
            const idx = posts.findIndex(p => p.id === post.id)
            if (idx === -1) {
                await customAlert('文章未找到')
                return
            }

            let coverUrl = cover.value.trim()

            // 如果选择了本地封面，先上传
            if (useRemote && coverFile.files && coverFile.files[0]) {
                try {
                    const file = coverFile.files[0]
                    const buffer = await new Promise((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onload = () => resolve(reader.result)
                        reader.onerror = reject
                        reader.readAsArrayBuffer(file)
                    })
                    const base64 = arrayBufferToBase64(buffer)
                    const folder = REPO_PATH_MAP[cat.value] || 'Essay'
                    const safeTitle = (title.value.trim() || 'post').replace(/[^a-z0-9]/ig, '_').substring(0, 30)
                    const ext = file.name.split('.').pop().toLowerCase()
                    const safeName = `${safeTitle}_cover.${ext}`
                    const imagePath = `${folder}/${safeName}`

                    await uploadContentToRepo(imagePath, base64, tokenVal, `Upload cover ${safeName}`)
                    coverUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${imagePath}`
                } catch (err) {
                    await customAlert('封面上传失败：' + err.message, '上传失败')
                    console.error(err)
                    return
                }
            }

            posts[idx].cover = coverUrl
            posts[idx].title = title.value.trim()
            posts[idx].desc = desc.value.trim()
            posts[idx].category = cat.value
            posts[idx].lastModified = Date.now()

            // 如果配置了 GitHub Token，保存 Token 到本地
            if (useRemote && tokenVal) {
                setGitHubToken(tokenVal)
            }

            savePosts(posts)
            document.body.removeChild(backdrop)
            location.hash = 'edit-' + post.id
        }
    })

    modal.querySelector('#ed-save').addEventListener('click', async () => {
        const provided = pwd.value || ''
        if (provided !== MASTER) {
            await customAlert('密码错误：需要主密码以发布/编辑文章', '密码错误')
            return
        }

        const useRemote = remoteCheckbox.checked
        const tokenVal = token.value.trim()

        if (useRemote && !tokenVal) {
            await customAlert('要同步到 GitHub，请提供 Personal Access Token', '提示')
            return
        }

        const posts = getPosts()

        if (mode === 'create') {
            const id = Date.now()
            let coverUrl = cover.value.trim()

            // 如果选择了本地封面，先上传
            if (useRemote && coverFile.files && coverFile.files[0]) {
                try {
                    const file = coverFile.files[0]
                    const buffer = await new Promise((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onload = () => resolve(reader.result)
                        reader.onerror = reject
                        reader.readAsArrayBuffer(file)
                    })
                    const base64 = arrayBufferToBase64(buffer)
                    const folder = REPO_PATH_MAP[cat.value] || 'Essay'
                    const safeName = Date.now() + '_' + file.name.replace(/[^a-z0-9.\-]/ig, '_')
                    const imagePath = `${folder}/${safeName}`

                    await uploadContentToRepo(imagePath, base64, tokenVal, `Upload cover ${safeName}`)
                    coverUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${imagePath}`
                } catch (err) {
                    await customAlert('封面上传失败：' + err.message, '上传失败')
                    console.error(err)
                    return
                }
            }

            const newPost = {
                id,
                type: 'article',
                cover: coverUrl,
                title: title.value.trim(),
                desc: desc.value.trim(),
                category: cat.value,
                content: ''
            }
            posts.unshift(newPost)
            savePosts(posts)
        } else {
            const idx = posts.findIndex(p => p.id === post.id)
            if (idx === -1) {
                await customAlert('原文章未找到')
                return
            }

            const oldTitle = posts[idx].title
            const oldCategory = posts[idx].category
            const oldRepoPath = posts[idx].repoPath

            let coverUrl = cover.value.trim()

            // 如果选择了本地封面，先上传
            if (useRemote && coverFile.files && coverFile.files[0]) {
                try {
                    const file = coverFile.files[0]
                    const buffer = await new Promise((resolve, reject) => {
                        const reader = new FileReader()
                        reader.onload = () => resolve(reader.result)
                        reader.onerror = reject
                        reader.readAsArrayBuffer(file)
                    })
                    const base64 = arrayBufferToBase64(buffer)
                    const folder = REPO_PATH_MAP[cat.value] || 'Essay'
                    const safeName = Date.now() + '_' + file.name.replace(/[^a-z0-9.\-]/ig, '_')
                    const imagePath = `${folder}/${safeName}`

                    await uploadContentToRepo(imagePath, base64, tokenVal, `Upload cover ${safeName}`)
                    coverUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${imagePath}`
                } catch (err) {
                    await customAlert('封面上传失败：' + err.message, '上传失败')
                    console.error(err)
                    return
                }
            }

            // 更新文章元数据
            posts[idx].cover = coverUrl
            posts[idx].title = title.value.trim()
            posts[idx].desc = desc.value.trim()
            posts[idx].category = cat.value

            // 如果标题或分类改变，且文章已同步到 GitHub，需要更新远程文件
            const titleChanged = oldTitle !== posts[idx].title
            const categoryChanged = oldCategory !== posts[idx].category

            if (oldRepoPath && (titleChanged || categoryChanged)) {
                if (useRemote && tokenVal) {
                    const confirmUpdate = await customConfirm('⚠️ 检测到标题或分类已更改\n\n是否同步更新 GitHub 上的文章？\n\n注意：旧文件会被删除，新文件会被创建', '确认更新')

                    if (confirmUpdate) {
                        try {
                            // 删除旧文件
                            await deleteFileFromRepo({ ...posts[idx], title: oldTitle, category: oldCategory, repoPath: oldRepoPath }, tokenVal)

                            // 上传新文件（如果有内容）
                            if (posts[idx].content) {
                                const res = await uploadFileToRepo(posts[idx], tokenVal)
                                posts[idx].repoSha = res.sha
                                posts[idx].repoPath = res.path
                                await customAlert('✅ GitHub 同步成功！\n\n旧文件已删除，新文件已创建\n路径：' + res.path, '同步成功')
                            } else {
                                // 清除 repoPath，因为旧文件已删除但新文件还没内容
                                posts[idx].repoPath = null
                                posts[idx].repoSha = null
                                await customAlert('✅ 旧文件已从 GitHub 删除\n\n💡 提示：编辑正文并保存后会创建新文件', '提示')
                            }
                        } catch (err) {
                            await customAlert('❌ GitHub 同步失败：' + err.message + '\n\n元数据已保存到本地', '同步失败')
                            console.error(err)
                        }
                    }
                } else {
                    // 没有提供 Token，但分类或标题改变了，提醒用户
                    await customAlert('⚠️ 检测到标题或分类已更改\n\n元数据已保存到本地\n\n💡 提示：勾选"同步GitHub"并提供Token可同步删除旧文件', '提示')
                    // 清除旧的 repoPath，因为路径已经不对了
                    posts[idx].repoPath = null
                    posts[idx].repoSha = null
                }
            }

            savePosts(posts)
        }

        document.body.removeChild(backdrop)
        router()
    })
}

async function deletePost(id) {
    const posts = getPosts()
    const idx = posts.findIndex(p => p.id === id)
    if (idx === -1) {
        await customAlert('文章不存在')
        return
    }

    const post = posts[idx]
    
    // 保存删除前的数据（用于回滚）
    const deletedPost = posts[idx]

    // 如果文章已同步到 GitHub，询问是否删除远程文件
    if (post.repoPath) {
        const confirmDelete = await customConfirm('⚠️ 此文章已同步到 GitHub\n\n确定要删除吗？（需要输入 Token 才能删除远程文件）', '确认删除')
        if (!confirmDelete) return

        const input = await customPrompt('请输入主密码以删除文章：', '', '输入密码', 'password', '验证密码')
        if (input === null) return
        if (input !== MASTER) {
            await customAlert('密码错误', '错误')
            return
        }

        const token = await customPrompt('请输入 GitHub Token（删除远程文件）：\n\n如果不输入，将仅删除本地文章', '', 'GitHub Token (可选)', 'password', 'GitHub Token')

        if (token && token.trim()) {
            // 尝试从 GitHub 删除
            try {
                await deleteFileFromRepo(post, token.trim())
                posts.splice(idx, 1)
                savePosts(posts)
                
                // 同步到云端
                try {
                    await syncData(false)
                    showNotification('✅ 文章删除成功！', 'success')
                    router()
                } catch (syncErr) {
                    // 云端同步失败，回滚
                    posts.splice(idx, 0, deletedPost)
                    savePosts(posts)
                    await customAlert('❌ 云端同步失败：' + syncErr.message + '\n\n文章删除已回滚', '同步失败')
                }
            } catch (e) {
                const confirmLocal = await customConfirm('❌ GitHub 删除失败：' + e.message + '\n\n是否仅删除本地文章？', 'GitHub 删除失败')
                if (confirmLocal) {
                    posts.splice(idx, 1)
                    savePosts(posts)
                    
                    // 同步到云端
                    try {
                        await syncData(false)
                        showNotification('✅ 本地文章删除成功！', 'success')
                        router()
                    } catch (syncErr) {
                        // 云端同步失败，回滚
                        posts.splice(idx, 0, deletedPost)
                        savePosts(posts)
                        await customAlert('❌ 云端同步失败：' + syncErr.message + '\n\n文章删除已回滚', '同步失败')
                    }
                }
            }
        } else {
            // 仅删除本地
            posts.splice(idx, 1)
            savePosts(posts)
            
            // 同步到云端
            try {
                await syncData(false)
                showNotification('✅ 本地文章删除成功！', 'success')
                router()
            } catch (e) {
                // 云端同步失败，回滚
                posts.splice(idx, 0, deletedPost)
                savePosts(posts)
                await customAlert('❌ 文章删除失败：' + e.message + '\n\n请检查网络连接后重试', '删除失败')
            }
        }
    } else {
        // 文章未同步，直接删除
        const input = await customPrompt('请输入主密码以删除文章：', '', '输入密码', 'password', '验证密码')
        if (input === null) return
        if (input !== MASTER) {
            await customAlert('密码错误', '错误')
            return
        }

        posts.splice(idx, 1)
        savePosts(posts)
        
        // 同步到云端
        try {
            await syncData(false)
            showNotification('✅ 文章删除成功！', 'success')
            router()
        } catch (e) {
            // 云端同步失败，回滚
            posts.splice(idx, 0, deletedPost)
            savePosts(posts)
            await customAlert('❌ 文章删除失败：' + e.message + '\n\n请检查网络连接后重试', '删除失败')
        }
    }
}

// 已移除 GitHub 同步设置（改用 JSONBin 云数据库）

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    }[ch]))
}

function goBack() {
    try {
        if (history.length > 1) history.back()
        else location.hash = 'categories'
    } catch (e) {
        location.hash = 'categories'
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // ==================== 强制清除缓存机制 ====================
    const cachedVersion = localStorage.getItem('app_version')
    const isNewVersion = cachedVersion !== APP_VERSION

    if (isNewVersion) {
        console.log('🔄 检测到新版本:', APP_VERSION, '正在清除旧缓存...')
        localStorage.setItem('app_version', APP_VERSION)

        // 清除所有缓存
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        console.log('🗑️ 删除缓存:', cacheName)
                        return caches.delete(cacheName)
                    })
                )
            }).then(() => {
                console.log('✅ 所有缓存已清除')
            })
        }

        // 注销所有旧的 Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(registrations => {
                return Promise.all(registrations.map(reg => {
                    console.log('🗑️ 注销旧 Service Worker')
                    return reg.unregister()
                }))
            })
        }
    }

    // ==================== 页面加载时自动从云端同步数据 ====================
    // 恢复保存的记录 ID
    const savedRecordId = localStorage.getItem('supabase_record_id')
    if (savedRecordId) {
        dataRecordId = savedRecordId
    }

    console.log('📡 正在从云端同步数据...')
    syncData(false).then(() => {
        console.log('✅ 数据同步成功')
        router() // 刷新页面显示最新数据
    }).catch(e => {
        console.log('⚠️ 数据同步失败，使用本地数据:', e.message)
        router()
    })

    // ==================== 注册 Service Worker（自动更新机制）====================
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js?v=' + APP_VERSION, {
            updateViaCache: 'none' // 禁用 Service Worker 脚本缓存
        }).then(reg => {
            console.log('✅ Service Worker 已注册:', reg.scope)

            // 立即检查更新
            reg.update()

            // 如果有等待中的 Service Worker，立即激活
            if (reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' })
            }

            // 监听新版本安装
            reg.addEventListener('updatefound', () => {
                const newSW = reg.installing
                if (!newSW) return

                newSW.addEventListener('statechange', () => {
                    if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
                        console.log('🔄 新版本已安装，正在激活...')
                        newSW.postMessage({ type: 'SKIP_WAITING' })
                    }
                })
            })

            // 定期检查更新（每30秒）
            setInterval(() => {
                reg.update()
            }, 30000)
        }).catch(err => {
            console.warn('⚠️ Service Worker 注册失败:', err)
        })

        // 监听 Service Worker 控制器变化（自动刷新）
        let refreshing = false
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                refreshing = true
                console.log('🔄 新版本已激活，正在刷新页面...')
                window.location.reload()
            }
        })
    }

    // ==================== 定期自动同步（每5分钟）====================
    syncInterval = setInterval(() => {
        console.log('⏰ 定期自动同步...')
        syncData(false).catch(e => {
            console.log('⚠️ 定期同步失败:', e.message)
        })
    }, 300000) // 5分钟

    // ==================== 页面可见性变化时同步 ====================
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            console.log('👁️ 页面重新可见，检查更新...')

            // 检查 Service Worker 更新
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistration().then(reg => {
                    if (reg) reg.update()
                })
            }

            // 同步数据
            syncData(false).then(() => {
                router() // 刷新页面显示最新数据
            }).catch(e => {
                console.log('⚠️ 页面切换同步失败:', e.message)
            })
        }
    })

    // ==================== 页面关闭前同步数据 ====================
    window.addEventListener('beforeunload', () => {
        // 清除定时器
        if (syncInterval) {
            clearInterval(syncInterval)
        }

        // 尝试最后一次同步（使用 sendBeacon）
        const posts = getPosts()
        const messages = getMessages()
        const data = {
            posts: posts,
            messages: messages,
            lastModified: Date.now(),
            version: APP_VERSION
        }

        // Supabase 不支持 sendBeacon，跳过
    })

    // 语言切换按钮
    const langBtn = document.getElementById('langBtn')
    if (langBtn) {
        langBtn.addEventListener('click', () => {
            currentLang = currentLang === 'zh' ? 'en' : 'zh'
            langBtn.innerText = currentLang === 'zh' ? 'EN' : '中文'
            router()
            document.querySelectorAll('.nav-item').forEach(a => {
                const k = a.dataset.key
                a.innerText = t(k)
            })
        })
    }

    // 初始化导航文本
    document.querySelectorAll('.nav-item').forEach(a => {
        const k = a.dataset.key
        a.innerText = t(k)
    })

    // 设置背景
    setBackground()

    // 路由监听
    window.addEventListener('hashchange', router)
})

