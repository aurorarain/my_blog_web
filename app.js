// 配置区：将下面的 BG_IMAGE、USER_* 替换为你的内容
const BG_IMAGE = 'background.png' // 使用工作区内的 background.png 作为背景图
const USER_PHOTO = 'my_photo.png' // 个人照片地址
// 首页内容请分别填写中/英文（手工维护）
const USER_NAME_ZH = '嵇志豪'
const USER_BIO_ZH = '在此写入中文个人简介。可以包含职业、技能、经验等简短描述。'
const USER_NAME_EN = 'ZhoJimmy'
const USER_BIO_EN = 'Write your English bio here. Short summary of your role, skills and experience.'
const USER_CONTACT = [
    { type: 'Email', value: '1839735394@qq.com' },
    { type: 'GitHub', value: 'https://github.com/aurorarain' }
]

// 防抖函数 - 性能优化
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 多语言文案
const i18n = {
    zh: {
        'nav.home': '首页', 'nav.categories': '博客', 'nav.board': '留言板',
        'home.title': '关于我', 'home.contact': '联系方式',
        'categories.title': '分类', 'board.title': '留言板', 'board.placeholder': '请输入留言', 'board.nick': '请输入昵称', 'board.pwd': '请输入密码(用于删除留言)', 'board.post': '发布'
    },
    en: {
        'nav.home': 'Home', 'nav.categories': 'Categories', 'nav.board': 'Board',
        'home.title': 'About Me', 'home.contact': 'Contact',
        'categories.title': 'Categories', 'board.title': 'Message Board', 'board.placeholder': 'Please enter a message', 'board.nick': 'Please enter a nickname', 'board.pwd': 'Enter password (for deletion)', 'board.post': 'Post'
    }
}

let currentLang = 'zh'

function t(key) { return (i18n[currentLang] && i18n[currentLang][key]) || key }

function setBackground() {
    if (BG_IMAGE && BG_IMAGE.trim()) { document.documentElement.style.setProperty('--bg-url', `url('${BG_IMAGE}')`) }
}

// Posts 存储（仅 article），保存在 localStorage
const MASTER = 'jzh0128' // 主密码：用于发布/编辑/删除文章

const sampleArticles = [
    { id: 1, type: 'article', title: '示例文章 A', desc: '文章简介示例。', cover: '', content: '# 示例文章 A\n\n这是文章的 Markdown 内容示例。', category: '随笔' },
    { id: 2, type: 'article', title: '示例文章 B', desc: '另一篇示例文章。', cover: '', content: '# 示例文章 B\n\n内容示例...', category: '编程技术' }
]

function getPosts() {
    const raw = localStorage.getItem('myblog_posts')
    if (!raw) { localStorage.setItem('myblog_posts', JSON.stringify(sampleArticles)); return sampleArticles.slice() }
    try { return JSON.parse(raw) } catch (e) { return sampleArticles.slice() }
}

function savePosts(posts) { localStorage.setItem('myblog_posts', JSON.stringify(posts)) }

const categories = ['随笔', '编程技术', '算法', '计算机知识', '英语', '数学']

// --- GitHub Repository Contents API helpers (create/update/delete) ---
const GITHUB_API_BASE = 'https://api.github.com';
const REPO_OWNER = 'aurorarain'; // 已由用户提供
const REPO_NAME = 'my_blog_web_storage'; // 已由用户提供
const REPO_BRANCH = 'main'; // 默认分支
// 分类到仓库路径的映射（用户提供）
const REPO_PATH_MAP = {
    '随笔': 'Essay',
    '编程技术': 'Coding',
    '算法': 'Algorithm',
    '计算机知识': 'CSKnowledge',
    '英语': 'English',
    '数学': 'Math'
};

// 全局 base64 助手：UTF-8 安全
function toBase64(str) { return btoa(unescape(encodeURIComponent(str))); }
function arrayBufferToBase64(buffer) { let binary = ''; const bytes = new Uint8Array(buffer); const len = bytes.byteLength; for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]); return btoa(binary); }

// 通用的通过 Contents API 上传任意内容（Base64 编码）
async function uploadContentToRepo(targetPath, base64Content, token, message = 'Update content') {
    const fileUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${targetPath}`;
    const headers = { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' };

    // 检查是否存在以获取 sha
    let sha = null;
    try {
        const resCheck = await fetch(fileUrl, { headers });
        if (resCheck.ok) {
            const d = await resCheck.json(); sha = d.sha
        }
    } catch (e) { console.warn('check exist error', e) }

    const body = { message, content: base64Content, branch: REPO_BRANCH };
    if (sha) body.sha = sha;

    const res = await fetch(fileUrl, { method: 'PUT', headers, body: JSON.stringify(body) });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error('文件上传失败: ' + res.status + ' ' + text);
    }
    const j = await res.json();
    return { sha: j.content && j.content.sha, path: j.content && j.content.path };
}

// 从 raw.githubusercontent.com 拉取原始文件内容（用于 GitHub Pages 上按需加载 Markdown）
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

// 专门用于文章 Markdown 上传：根据文章分类映射到对应目录
async function uploadFileToRepo(post, token) {
    const folder = REPO_PATH_MAP[post.category] || REPO_PATH_MAP['随笔'] || '';
    const filename = (post.title || 'post').replace(/[^a-z0-9]/ig, '_') + '.md';
    const targetPath = folder ? `${folder}/${filename}` : filename;
    const content = toBase64(`# ${post.title}\n\n${post.content || ''}`);
    return await uploadContentToRepo(targetPath, content, token, `Update post: ${post.title}`);
}

async function deleteFileFromRepo(post, token) {
    // 优先使用 post.repoPath（创建时保存的 path），否则根据 title+category 计算
    const path = post.repoPath || ((REPO_PATH_MAP[post.category] || '') + '/' + (post.title || 'post').replace(/[^a-z0-9]/ig, '_') + '.md');
    const fileUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;
    const headers = { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' };

    const res = await fetch(fileUrl, { headers });
    if (!res.ok) throw new Error('文件不存在或无法访问: ' + res.status);
    const data = await res.json();

    const body = { message: `Delete post: ${post.title}`, sha: data.sha, branch: REPO_BRANCH };
    const deleteRes = await fetch(fileUrl, { method: 'DELETE', headers, body: JSON.stringify(body) });
    if (!deleteRes.ok) throw new Error('文件删除失败: ' + deleteRes.status);
    return true;
}

// --- Full-page markdown editor for a post ---
function renderEditPage(id) {
    const post = getPosts().find(p => p.id == id)
    if (!post) return alert('文章未找到')
    document.getElementById('app').innerHTML = `<section class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <h2>编辑正文：${escapeHtml(post.title)}</h2>
            <div style="display:flex;gap:8px">
                <button id="admin-md" title="编辑元数据">⚙️ 设置</button>
                <button id="delete-md" title="删除文章" style="color:#d73a49">🗑️ 删除</button>
            </div>
        </div>
        <div style="display:flex;gap:12px;flex-direction:column">
            <textarea id="full-md" style="width:100%;min-height:400px">${escapeHtml(post.content || '')}</textarea>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
                <input id="edit-token" placeholder="GitHub Token（用于同步）" style="flex:1;min-width:200px"/>
                <button id="save-md" style="background:#28a745;color:white;border-color:#28a745">💾 保存并同步</button>
                <button id="cancel-md">❌ 取消</button>
            </div>
        </div>
    </section>`

    const textarea = document.getElementById('full-md')
    let easyMDE = null
    
    // 安全的 Markdown 渲染函数
    function renderMarkdown(md) {
        if (!md) return '';
        if (window.marked) {
            try {
                // 配置 marked 以提高安全性和兼容性
                marked.setOptions({
                    breaks: true,
                    gfm: true,
                    headerIds: true,
                    mangle: false,
                    sanitize: false,
                    smartLists: true,
                    smartypants: false,
                    xhtml: false
                });
                return marked.parse(md);
            } catch (e) {
                console.error('Markdown parsing error:', e);
                return '<pre>' + escapeHtml(md) + '</pre>';
            }
        }
        return '<pre>' + escapeHtml(md) + '</pre>';
    }

    // 如果 EasyMDE 已加载，则用它增强编辑体验（侧边实时预览、工具栏等）
    if (window.EasyMDE) {
        try {
            easyMDE = new EasyMDE({
                element: textarea,
                spellChecker: false,
                status: ['lines', 'words', 'cursor'],
                autosave: { 
                    enabled: true,
                    uniqueId: 'post_' + id,
                    delay: 1000
                },
                toolbar: [
                    {
                        name: 'bold',
                        action: EasyMDE.toggleBold,
                        className: 'fa fa-bold',
                        title: '粗体 (Ctrl+B)'
                    },
                    {
                        name: 'italic',
                        action: EasyMDE.toggleItalic,
                        className: 'fa fa-italic',
                        title: '斜体 (Ctrl+I)'
                    },
                    {
                        name: 'strikethrough',
                        action: EasyMDE.toggleStrikethrough,
                        className: 'fa fa-strikethrough',
                        title: '删除线'
                    },
                    '|',
                    {
                        name: 'heading-1',
                        action: EasyMDE.toggleHeading1,
                        className: 'fa fa-header fa-header-x fa-header-1',
                        title: '一级标题'
                    },
                    {
                        name: 'heading-2',
                        action: EasyMDE.toggleHeading2,
                        className: 'fa fa-header fa-header-x fa-header-2',
                        title: '二级标题'
                    },
                    {
                        name: 'heading-3',
                        action: EasyMDE.toggleHeading3,
                        className: 'fa fa-header fa-header-x fa-header-3',
                        title: '三级标题'
                    },
                    '|',
                    {
                        name: 'quote',
                        action: EasyMDE.toggleBlockquote,
                        className: 'fa fa-quote-left',
                        title: '引用'
                    },
                    {
                        name: 'unordered-list',
                        action: EasyMDE.toggleUnorderedList,
                        className: 'fa fa-list-ul',
                        title: '无序列表'
                    },
                    {
                        name: 'ordered-list',
                        action: EasyMDE.toggleOrderedList,
                        className: 'fa fa-list-ol',
                        title: '有序列表'
                    },
                    '|',
                    {
                        name: 'code',
                        action: EasyMDE.toggleCodeBlock,
                        className: 'fa fa-code',
                        title: '代码块'
                    },
                    {
                        name: 'link',
                        action: EasyMDE.drawLink,
                        className: 'fa fa-link',
                        title: '插入链接 (Ctrl+K)'
                    },
                    {
                        name: 'image',
                        action: EasyMDE.drawImage,
                        className: 'fa fa-picture-o',
                        title: '插入图片'
                    },
                    {
                        name: 'table',
                        action: EasyMDE.drawTable,
                        className: 'fa fa-table',
                        title: '插入表格'
                    },
                    '|',
                    {
                        name: 'preview',
                        action: EasyMDE.togglePreview,
                        className: 'fa fa-eye no-disable',
                        title: '预览'
                    },
                    {
                        name: 'side-by-side',
                        action: EasyMDE.toggleSideBySide,
                        className: 'fa fa-columns no-disable no-mobile',
                        title: '分屏预览'
                    },
                    {
                        name: 'fullscreen',
                        action: EasyMDE.toggleFullScreen,
                        className: 'fa fa-arrows-alt no-disable no-mobile',
                        title: '全屏 (F11)'
                    },
                    '|',
                    {
                        name: 'guide',
                        action: 'https://www.markdownguide.org/basic-syntax/',
                        className: 'fa fa-question-circle',
                        title: 'Markdown 指南'
                    },
                    {
                        name: 'undo',
                        action: EasyMDE.undo,
                        className: 'fa fa-undo no-disable',
                        title: '撤销 (Ctrl+Z)'
                    },
                    {
                        name: 'redo',
                        action: EasyMDE.redo,
                        className: 'fa fa-repeat no-disable',
                        title: '重做 (Ctrl+Y)'
                    }
                ],
                previewRender: function (plainText) {
                    return renderMarkdown(plainText);
                },
                placeholder: '请输入 Markdown 内容...\n\n支持 GitHub Flavored Markdown (GFM) 语法',
                tabSize: 4,
                indentWithTabs: false,
                lineWrapping: true,
                sideBySideFullscreen: false,
                shortcuts: {
                    toggleBold: 'Ctrl-B',
                    toggleItalic: 'Ctrl-I',
                    drawLink: 'Ctrl-K',
                    toggleHeadingSmaller: 'Ctrl-H',
                    toggleCodeBlock: 'Ctrl-Alt-C',
                    togglePreview: 'Ctrl-P',
                    toggleSideBySide: 'F9',
                    toggleFullScreen: 'F11'
                }
            })
        } catch (e) {
            console.warn('EasyMDE init failed', e)
            easyMDE = null
        }
    }
    // 如果本地没有正文但文章包含远端路径，尝试从 raw.githubusercontent.com 拉取
    if ((!post.content || post.content.trim() === '') && post.repoPath) {
        fetchRawFile(post.repoPath).then(txt => {
            if (txt) {
                if (easyMDE) { easyMDE.value(txt) } else { textarea.value = txt }
                // 也把内容保存到本地缓存，减少后续请求
                const posts = getPosts(); const idx = posts.findIndex(p => p.id == id); if (idx !== -1) { posts[idx].content = txt; savePosts(posts) }
            }
        }).catch(e => {
            console.error('Failed to fetch remote content:', e);
        })
    }

    document.getElementById('save-md').addEventListener('click', async () => {
        const md = easyMDE ? easyMDE.value() : document.getElementById('full-md').value
        const token = document.getElementById('edit-token').value.trim()
        const posts = getPosts(); const idx = posts.findIndex(p => p.id == id)
        if (idx === -1) return alert('文章未找到')
        posts[idx].content = md; savePosts(posts)
        if (token) {
            try {
                const res = await uploadFileToRepo(posts[idx], token);
                posts[idx].repoSha = res.sha;
                posts[idx].repoPath = res.path;
                savePosts(posts);
                alert('保存并同步成功！')
            } catch (e) {
                alert('远程同步失败：' + e.message)
                console.warn(e)
                return
            }
        } else {
            alert('保存成功！（未同步到远程）')
        }
        // 保存后返回文章页
        location.hash = 'post-' + id
    })

    document.getElementById('cancel-md').addEventListener('click', () => { location.hash = 'post-' + id })
    document.getElementById('admin-md').addEventListener('click', () => { openEditor({ mode: 'edit', post }) })

    document.getElementById('delete-md').addEventListener('click', async () => {
        if (!confirm('确定要删除这篇文章吗？此操作不可恢复！')) return;
        
        const token = document.getElementById('edit-token').value.trim()
        const posts = getPosts(); const idx = posts.findIndex(p => p.id == id)
        if (idx === -1) return alert('文章未找到')

        if (post.repoPath && token) {
            try {
                await deleteFileFromRepo(posts[idx], token);
                posts.splice(idx, 1);
                savePosts(posts);
                alert('删除成功（包括远程文件）')
            } catch (e) {
                alert('远程删除失败：' + e.message)
                console.warn(e)
                return
            }
        } else {
            posts.splice(idx, 1);
            savePosts(posts);
            alert('删除成功')
        }

        location.hash = 'categories'
    })
}

// 翻译缓存（内存），减少重复请求
const _trCache = new Map()

// 自动翻译函数：使用 MyMemory 公共 API，注意它可能存在速率限制
async function translateText(text, targetLang = 'en') {
    if (!text) return text
    const key = targetLang + '::' + text
    if (_trCache.has(key)) return _trCache.get(key)
    try {
        const langpair = targetLang === 'en' ? 'zh|en' : 'en|zh'
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langpair}`
        const res = await fetch(url)
        const j = await res.json()
        const translated = j && j.responseData && j.responseData.translatedText ? j.responseData.translatedText : text
        _trCache.set(key, translated)
        return translated
    } catch (e) {
        console.warn('translateText error', e)
        return text
    }
}

// 路由
function router() {
    const hash = location.hash.replace('#', '') || 'home'
    // 支持编辑页面路由：edit-<id>，文章阅读路由：post-<id>
    if (hash.startsWith('edit-')) return renderEditPage(hash.replace('edit-', ''))
    if (hash.startsWith('post-')) return renderPostDetail(hash.replace('post-', ''))
    // 支持 categories-<cat> 路由以记录分类选择历史
    if (hash.startsWith('categories-')) return renderCategories(document.getElementById('app'), decodeURIComponent(hash.replace('categories-', '')))
    renderPage(hash)
}

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
            <img class="avatar" src="${USER_PHOTO || 'https://via.placeholder.com/400x400?text=Photo'}" alt="avatar">
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

// Projects page removed per user request

// 阅读文章（分类文章）的完整页面，Markdown 渲染为 HTML
function renderPostDetail(id) {
    const p = getPosts().find(x => x.id == id) || { title: '未找到', desc: '', content: '' }
    // 不在正文内渲染“返回”文字按钮，使用页面左上角的箭头（history.back）处理返回
    document.getElementById('app').innerHTML = `<section class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h2 class="pd-title">${escapeHtml(p.title)}</h2><div><button id="jump-edit">编辑</button></div></div><p class="pd-desc">${escapeHtml(p.desc)}</p><hr/><div class="pd-content markdown-body">${p.content ? (window.marked ? (function(){try{marked.setOptions({breaks:true,gfm:true,headerIds:true,mangle:false,sanitize:false,smartLists:true,smartypants:false,xhtml:false});return marked.parse(p.content)}catch(e){console.error('Markdown error:',e);return '<pre>'+escapeHtml(p.content)+'</pre>'}})() : '<pre>' + escapeHtml(p.content) + '</pre>') : '<p>正在加载正文...</p>'}</div></section>`
    // 文章页面增加跳转到编辑页
    const jumpBtn = document.getElementById('jump-edit')
    if (jumpBtn) jumpBtn.addEventListener('click', () => { location.hash = 'edit-' + id })
    // 如果本地没有正文但存在远端 repoPath，则尝试从 raw.githubusercontent.com 拉取并渲染
    if ((!p.content || p.content.trim() === '') && p.repoPath) {
        const contentEl = document.querySelector('.pd-content')
        if (contentEl) {
            contentEl.innerHTML = '<p>正在从远端加载文章内容……</p>'
            fetchRawFile(p.repoPath).then(txt => {
                if (txt) {
                    p.content = txt
                    // 保存到本地以便离线查看
                    const posts = getPosts(); const idx = posts.findIndex(x => x.id == id); if (idx !== -1) { posts[idx].content = txt; savePosts(posts) }
                    const out = window.marked ? (function(){try{marked.setOptions({breaks:true,gfm:true,headerIds:true,mangle:false,sanitize:false,smartLists:true,smartypants:false,xhtml:false});return marked.parse(txt)}catch(e){console.error('Markdown error:',e);return '<pre>'+escapeHtml(txt)+'</pre>'}})() : '<pre>' + escapeHtml(txt) + '</pre>'
                    contentEl.innerHTML = out
                } else {
                    contentEl.innerHTML = '<p>无法加载远端内容</p>'
                }
            }).catch(e => { console.warn(e); contentEl.innerHTML = '<p>加载失败</p>' })
        }
    }
    if (currentLang === 'en') {
        translateText(p.title, 'en').then(tt => { const el = document.querySelector('.pd-title'); if (el) el.innerText = tt })
        translateText(p.desc, 'en').then(td => { const el = document.querySelector('.pd-desc'); if (el) el.innerText = td })
    }
}

function renderCategories(root, selectedCat) {
    // 在分类列表前增加“全部”选项
    root.innerHTML = `<section class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h2>${t('categories.title')}</h2><div><button id="addArticleBtn">发布文章</button></div></div>
        <div class="categories"><button class="cat-btn" data-cat="all">全部</button>${categories.map((c, i) => `<button class="cat-btn" data-cat="${c}">${c}</button>`).join('')}</div>
        <div id="posts" class="posts-grid"></div>
    </section>`

    document.querySelectorAll('.cat-btn').forEach(btn => btn.addEventListener('click', e => {
        const catKey = e.currentTarget.dataset.cat
        // 使用 hash 导航，这样会记录选择的分类到历史记录，方便回退
        location.hash = 'categories-' + encodeURIComponent(catKey)
    }))

    document.getElementById('addArticleBtn').addEventListener('click', () => openEditor({ mode: 'create', type: 'article' }))

    // 如果通过路由指定了选中分类，则展示对应内容，否则默认显示“全部”分类
    if (selectedCat) renderPostsForCategory(selectedCat)
    else renderPostsForCategory('all')
}

function renderPostsForCategory(cat) {
    let posts
    if (cat === 'all') {
        // 全部：显示所有文章类型为 article 的文章
        posts = getPosts().filter(p => p.type === 'article')
    } else {
        posts = getPosts().filter(p => p.type === 'article' && p.category === cat)
    }
    const el = document.getElementById('posts')
    el.innerHTML = posts.map(p => `<div class="post card" data-id="${p.id}"><img src="${p.cover || 'https://via.placeholder.com/320x180'}"><div><h4 class="post-title">${p.title}</h4><p class="post-desc">${p.desc}</p></div><div style="margin-left:auto"><button class="edit-post" data-id="${p.id}">编辑</button><button class="del-post" data-id="${p.id}">删除</button></div></div>`).join('')
    if (currentLang === 'en') {
        posts.forEach((p, i) => {
            translateText(p.title, 'en').then(tt => { const tEls = document.querySelectorAll('#posts .post-title'); if (tEls[i]) tEls[i].innerText = tt })
            translateText(p.desc, 'en').then(td => { const dEls = document.querySelectorAll('#posts .post-desc'); if (dEls[i]) dEls[i].innerText = td })
        })
    }

    // 点击卡片打开文章详情（使用 hash 导航以保留历史记录）
    document.querySelectorAll('#posts .post').forEach(card => card.addEventListener('click', e => {
        const id = card.dataset.id
        location.hash = 'post-' + id
    }))

    document.querySelectorAll('#posts .edit-post').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const id = +e.currentTarget.dataset.id; const post = getPosts().find(p => p.id === id); openEditor({ mode: 'edit', post }) }))
    document.querySelectorAll('#posts .del-post').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); const id = +e.currentTarget.dataset.id; deletePost(id) }))
}

// 留言板
function renderBoard(root) {
    root.innerHTML = `<section class="card"><h2>${t('board.title')}</h2>
        <div class="board-form">
            <input id="nick" placeholder="${t('board.nick')}" />
            <input id="pwd" placeholder="${t('board.pwd') || '密码（用于删除）'}" style="width:180px;" />
            <input id="msg" placeholder="${t('board.placeholder')}" style="flex:1;" />
            <button id="postBtn">${t('board.post')}</button>
        </div>
        <div id="messages" class="board-list"></div>
    </section>`

    document.getElementById('postBtn').addEventListener('click', postMessage)
    loadMessages()
}

function loadMessages() {
    const msgs = JSON.parse(localStorage.getItem('myblog_msgs') || '[]')
    const box = document.getElementById('messages')
    box.innerHTML = msgs.map((m, idx) => `<div class="message"><div><strong>${escapeHtml(m.nick || '访客')}</strong> <small>${new Date(m.t).toLocaleString()}</small> <button data-idx="${idx}" class="del-btn">删除</button></div><div>${escapeHtml(m.text)}</div></div>`).join('')

    // 绑定删除事件
    box.querySelectorAll('.del-btn').forEach(btn => btn.addEventListener('click', e => {
        const idx = +e.currentTarget.dataset.idx
        tryDelete(idx)
    }))
}

function postMessage() {
    const nickRaw = document.getElementById('nick').value.trim()
    const nick = nickRaw || '访客'
    const pwd = document.getElementById('pwd').value || ''
    const text = document.getElementById('msg').value.trim()
    if (!text) return alert('请输入内容')

    const msgs = JSON.parse(localStorage.getItem('myblog_msgs') || '[]')

    // 禁止重名（仅对非访客生效）
    if (nick !== '访客') {
        const exists = msgs.some(m => (m.nick || '').toLowerCase() === nick.toLowerCase())
        if (exists) return alert('昵称已存在，请换一个昵称')
        if (!pwd.trim()) return alert('请输入密码用于将来删除留言')
    }

    msgs.unshift({ nick, text, t: Date.now(), pwd: pwd })
    localStorage.setItem('myblog_msgs', JSON.stringify(msgs))
    document.getElementById('msg').value = ''
    document.getElementById('pwd').value = ''
    loadMessages()
}

// 删除：需要输入留言对应密码或主密码
function tryDelete(idx) {
    const msgs = JSON.parse(localStorage.getItem('myblog_msgs') || '[]')
    const m = msgs[idx]
    if (!m) return alert('留言不存在')
    const input = prompt('请输入删除密码：')
    if (input === null) return // 取消
    const MASTER = 'jzh0128'
    if (input === MASTER || (m.pwd && input === m.pwd)) {
        msgs.splice(idx, 1)
        localStorage.setItem('myblog_msgs', JSON.stringify(msgs))
        loadMessages()
        return alert('删除成功')
    }
    alert('密码错误，无法删除')
}

// Post management: editor modal, create/edit/delete posts (protected by MASTER password)
function openEditor({ mode = 'create', type = 'article', post = null } = {}) {
    // create modal DOM
    const backdrop = document.createElement('div'); backdrop.className = 'modal-backdrop'
    const modal = document.createElement('div'); modal.className = 'modal'
    modal.innerHTML = `
        <div><strong>${mode === 'create' ? '发布文章' : '编辑文章'}</strong></div>
        <div class="row"><label>封面</label><input id="ed-cover" type="url" placeholder="封面图片地址 (可选)"></div>
        <div class="row"><label>本地封面</label><input id="ed-cover-file" type="file" accept="image/*" /></div>
        <div class="row"><label>导入</label><input id="ed-import" type="file" accept=".md" /></div>
        <div class="row"><label>标题</label><input id="ed-title" type="text" placeholder="文章标题"></div>
        <div class="row"><label>简介</label><input id="ed-desc" type="text" placeholder="文章简介"></div>
        <div class="row" id="ed-cat-row"><label>分类</label><select id="ed-cat">${categories.map(c => `<option>${c}</option>`).join('')}</select></div>
        <div class="row"><label>远程</label><label style="flex:1"><input id="ed-remote" type="checkbox"> 发布到远程（GitHub 仓库）</label></div>
        <div class="row"><label>Token</label><input id="ed-token" type="text" placeholder="可选：GitHub Personal Access Token（编辑时输入）"></div>
        <div class="row"><label>密码</label><input id="ed-pwd" type="text" placeholder="输入主密码以确认发布/编辑"></div>
        <div class="actions"><button id="ed-open-full" style="margin-right:auto">编辑/预览正文</button><button id="ed-cancel">取消</button><button id="ed-save">保存</button></div>
    `
    backdrop.appendChild(modal); document.body.appendChild(backdrop)

    // prefill
    const cover = modal.querySelector('#ed-cover')
    const coverFile = modal.querySelector('#ed-cover-file')
    const title = modal.querySelector('#ed-title')
    const desc = modal.querySelector('#ed-desc')
    const cat = modal.querySelector('#ed-cat')
    const pwd = modal.querySelector('#ed-pwd')
    const importInput = modal.querySelector('#ed-import')
    const openFull = modal.querySelector('#ed-open-full')
    const catRow = modal.querySelector('#ed-cat-row')
    let importContent = ''
    if (post) { cover.value = post.cover || post.icon || ''; title.value = post.title || ''; desc.value = post.desc || ''; if (post.category) { [...cat.options].forEach(o => { if (o.value === post.category) o.selected = true }) }; importContent = post.content || '' }

    modal.querySelector('#ed-cancel').addEventListener('click', () => { document.body.removeChild(backdrop) })
    // 导入 .md 文件
    importInput.addEventListener('change', e => {
        const f = e.target.files && e.target.files[0]
        if (!f) return
        const reader = new FileReader()
        reader.onload = () => { importContent = reader.result }
        reader.readAsText(f)
    })

    // 打开全文编辑页（不在模态内编辑）
    openFull.addEventListener('click', () => {
        const provided = pwd.value || ''
        if (mode === 'create') {
            if (provided !== MASTER) return alert('密码错误：需要主密码以发布/编辑文章')
            const id = Date.now()
            const newPost = { id, type: 'article', cover: cover.value.trim(), icon: cover.value.trim(), title: title.value.trim(), desc: desc.value.trim(), category: cat.value, content: importContent || '' }
            const posts = getPosts(); posts.unshift(newPost); savePosts(posts)
            document.body.removeChild(backdrop); location.hash = 'edit-' + id; return
        } else {
            const posts = getPosts(); const idx = posts.findIndex(p => p.id === post.id)
            if (idx === -1) return alert('文章未找到')
            const providedPwd = pwd.value || ''
            if (providedPwd !== MASTER) return alert('密码错误：需要主密码以发布/编辑文章')
            posts[idx].type = 'article'; posts[idx].cover = cover.value.trim(); posts[idx].icon = cover.value.trim(); posts[idx].title = title.value.trim(); posts[idx].desc = desc.value.trim(); posts[idx].category = cat.value
            if (importContent) posts[idx].content = importContent
            savePosts(posts); document.body.removeChild(backdrop); location.hash = 'edit-' + post.id; return
        }
    })

    modal.querySelector('#ed-save').addEventListener('click', async () => {
        const provided = pwd.value || ''
        if (provided !== MASTER) return alert('密码错误：需要主密码以发布/编辑文章')
        const posts = getPosts()
        const useRemote = modal.querySelector('#ed-remote').checked
        const tokenVal = modal.querySelector('#ed-token').value.trim()

        if (mode === 'create') {
            const id = Date.now()
            const newPost = { id, type: 'article', cover: cover.value.trim(), icon: cover.value.trim(), title: title.value.trim(), desc: desc.value.trim(), category: cat.value, content: importContent || '' }
            // 先写本地
            posts.unshift(newPost); savePosts(posts)
            // 远程发布（可选）
            if (useRemote) {
                if (!tokenVal) return alert('要发布到远程，请提供 GitHub Token')
                try {
                    // 如果选择了本地封面，先上传封面到分类目录
                    if (coverFile && coverFile.files && coverFile.files[0]) {
                        const f = coverFile.files[0]
                        const buf = await new Promise((resolve, reject) => { const fr = new FileReader(); fr.onload = () => resolve(fr.result); fr.onerror = reject; fr.readAsArrayBuffer(f); })
                        const base64 = arrayBufferToBase64(buf)
                        const folder = REPO_PATH_MAP[cat.value] || REPO_PATH_MAP['随笔'] || ''
                        const safeName = Date.now() + '_' + f.name.replace(/[^a-z0-9.\-]/ig, '_')
                        const imagePath = folder ? `${folder}/${safeName}` : safeName
                        await uploadContentToRepo(imagePath, base64, tokenVal, `Upload cover ${safeName}`)
                        newPost.cover = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${imagePath}`
                        // update local saved cover
                        const psLocal = getPosts(); const idxLocal = psLocal.findIndex(p => p.id === id); if (idxLocal !== -1) { psLocal[idxLocal].cover = newPost.cover; savePosts(psLocal) }
                    }
                    const res = await uploadFileToRepo(newPost, tokenVal)
                    const ps = getPosts(); const idx = ps.findIndex(p => p.id === id); if (idx !== -1) { ps[idx].repoSha = res.sha; ps[idx].repoPath = res.path; savePosts(ps) }
                } catch (err) { alert('远程发布失败：' + err.message); console.warn(err) }
            }
            document.body.removeChild(backdrop); router()
        } else {
            // edit existing (meta only)
            const idx = posts.findIndex(p => p.id === post.id)
            if (idx === -1) return alert('原文章未找到')
            posts[idx].type = 'article'; posts[idx].cover = cover.value.trim(); posts[idx].icon = cover.value.trim(); posts[idx].title = title.value.trim(); posts[idx].desc = desc.value.trim(); posts[idx].category = cat.value
            if (importContent) posts[idx].content = importContent
            savePosts(posts)
            if (useRemote) {
                if (!tokenVal) return alert('要发布到远程，请提供 GitHub Token')
                try {
                    // 如果选择了本地封面，先上传封面到分类目录
                    if (coverFile && coverFile.files && coverFile.files[0]) {
                        const f = coverFile.files[0]
                        const buf = await new Promise((resolve, reject) => { const fr = new FileReader(); fr.onload = () => resolve(fr.result); fr.onerror = reject; fr.readAsArrayBuffer(f); })
                        const base64 = arrayBufferToBase64(buf)
                        const folder = REPO_PATH_MAP[posts[idx].category] || REPO_PATH_MAP['随笔'] || ''
                        const safeName = Date.now() + '_' + f.name.replace(/[^a-z0-9.\-]/ig, '_')
                        const imagePath = folder ? `${folder}/${safeName}` : safeName
                        await uploadContentToRepo(imagePath, base64, tokenVal, `Upload cover ${safeName}`)
                        posts[idx].cover = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}/${imagePath}`
                    }
                    const res = await uploadFileToRepo(posts[idx], tokenVal)
                    posts[idx].repoSha = res.sha; posts[idx].repoPath = res.path; savePosts(posts)
                } catch (err) { alert('远程同步失败：' + err.message); console.warn(err) }
            }
            document.body.removeChild(backdrop); router()
        }
    })
}

async function deletePost(id) {
    const input = prompt('请输入主密码以删除文章：')
    if (input === null) return
    if (input !== MASTER) return alert('密码错误')
    const posts = getPosts(); const idx = posts.findIndex(p => p.id === id); if (idx === -1) return alert('文章不存在')
    const post = posts[idx]
    // 如果存在远程文件，尝试删除远程
    if (post.repoPath) {
        const token = prompt('此文章托管在远程仓库，删除请提供 GitHub Token：')
        if (token === null) return
        try { await deleteFileFromRepo(post, token) } catch (e) { console.warn('删除远程文件失败', e) }
    }
    posts.splice(idx, 1); savePosts(posts); alert('删除成功'); router()
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch])) }

// 绑定语言切换
// 全局返回函数：优先使用历史记录，其次回到分类页
function goBack() {
    try {
        if (history.length > 1) history.back();
        else location.hash = 'categories'
    } catch (e) { location.hash = 'categories' }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('langBtn').addEventListener('click', () => {
        currentLang = currentLang === 'zh' ? 'en' : 'zh'
        document.getElementById('langBtn').innerText = currentLang === 'zh' ? 'EN' : '中文'
        // 重渲染当前页面以应用文案
        router()
        // 更新 nav 文案
        document.querySelectorAll('.nav-item').forEach(a => { const k = a.dataset.key; a.innerText = t(k) })
    })

    // 初始化 nav 文案
    document.querySelectorAll('.nav-item').forEach(a => { const k = a.dataset.key; a.innerText = t(k) })
    setBackground()
    window.addEventListener('hashchange', router)
    router()
})
