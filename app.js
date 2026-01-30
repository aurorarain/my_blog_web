// 配置区
const BG_IMAGE = 'background.png'
const USER_PHOTO = 'my_photo.png'
const USER_NAME_ZH = '嵇志豪'
const USER_BIO_ZH = '在此写入中文个人简介。可以包含职业、技能、经验等简短描述。'
const USER_NAME_EN = 'ZhoJimmy'
const USER_BIO_EN = 'Write your English bio here. Short summary of your role, skills and experience.'
const USER_CONTACT = [
    { type: 'Email', value: '1839735394@qq.com' },
    { type: 'GitHub', value: 'https://github.com/aurorarain' }
]

// 多语言
const i18n = {
    zh: {
        'nav.home': '首页', 'nav.categories': '博客', 'nav.board': '留言板',
        'home.title': '关于我', 'home.contact': '联系方式',
        'categories.title': '分类', 'board.title': '留言板', 
        'board.placeholder': '请输入留言', 'board.nick': '请输入昵称', 
        'board.pwd': '请输入密码(用于删除留言)', 'board.post': '发布'
    },
    en: {
        'nav.home': 'Home', 'nav.categories': 'Categories', 'nav.board': 'Board',
        'home.title': 'About Me', 'home.contact': 'Contact',
        'categories.title': 'Categories', 'board.title': 'Message Board', 
        'board.placeholder': 'Please enter a message', 'board.nick': 'Please enter a nickname', 
        'board.pwd': 'Enter password (for deletion)', 'board.post': 'Post'
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
const sampleArticles = [
    { id: 1, type: 'article', title: '示例文章 A', desc: '文章简介示例。', cover: '', content: '<h1>示例文章 A</h1><p>这是文章的内容示例。</p>', category: '随笔' },
    { id: 2, type: 'article', title: '示例文章 B', desc: '另一篇示例文章。', cover: '', content: '<h1>示例文章 B</h1><p>内容示例...</p>', category: '编程技术' }
]

function getPosts() {
    const raw = localStorage.getItem('myblog_posts')
    if (!raw) { 
        localStorage.setItem('myblog_posts', JSON.stringify(sampleArticles))
        return sampleArticles.slice() 
    }
    try { return JSON.parse(raw) } catch (e) { return sampleArticles.slice() }
}

function savePosts(posts) { localStorage.setItem('myblog_posts', JSON.stringify(posts)) }

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

async function uploadFileToRepo(post, token) {
    const folder = REPO_PATH_MAP[post.category] || REPO_PATH_MAP['随笔'] || ''
    const filename = (post.title || 'post').replace(/[^a-z0-9]/ig, '_') + '.html'
    const targetPath = folder ? `${folder}/${filename}` : filename
    const content = toBase64(post.content || '')
    return await uploadContentToRepo(targetPath, content, token, `Update post: ${post.title}`)
}

async function deleteFileFromRepo(post, token) {
    const path = post.repoPath || ((REPO_PATH_MAP[post.category] || '') + '/' + (post.title || 'post').replace(/[^a-z0-9]/ig, '_') + '.html')
    const fileUrl = `${GITHUB_API_BASE}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`
    const headers = { 'Authorization': `token ${token}`, 'Content-Type': 'application/json' }

    const res = await fetch(fileUrl, { headers })
    if (!res.ok) throw new Error('文件不存在或无法访问: ' + res.status)
    const data = await res.json()

    const body = { message: `Delete post: ${post.title}`, sha: data.sha, branch: REPO_BRANCH }
    const deleteRes = await fetch(fileUrl, { method: 'DELETE', headers, body: JSON.stringify(body) })
    if (!deleteRes.ok) throw new Error('文件删除失败: ' + deleteRes.status)
    return true
}

// 富文本编辑器页面
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
            <div id="editor-container" style="min-height:400px;background:white;border:1px solid #e6e6e6;border-radius:8px"></div>
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:12px">
                <input id="edit-token" placeholder="GitHub Token（用于同步）" style="flex:1;min-width:200px;padding:8px;border:1px solid #e6e6e6;border-radius:6px"/>
                <button id="save-md" style="background:#28a745;color:white;border-color:#28a745;padding:8px 16px;border-radius:6px;cursor:pointer">💾 保存并同步</button>
                <button id="cancel-md" style="padding:8px 16px;border-radius:6px;cursor:pointer">❌ 取消</button>
            </div>
        </div>
    </section>`

    let quill = null
    
    if (window.Quill) {
        try {
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
                        [{ 'script': 'sub'}, { 'script': 'super' }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        [{ 'align': [] }],
                        ['blockquote', 'code-block'],
                        ['link', 'image', 'video'],
                        ['clean']
                    ]
                }
            })
            
            if (post.content) {
                quill.root.innerHTML = post.content
            }
        } catch (e) {
            console.error('Quill init failed', e)
            alert('编辑器加载失败，请刷新页面重试')
            return
        }
    } else {
        alert('编辑器未加载，请刷新页面重试')
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
        if (!quill) return alert('编辑器未初始化')
        
        const htmlContent = quill.root.innerHTML
        const token = document.getElementById('edit-token').value.trim()
        const posts = getPosts()
        const idx = posts.findIndex(p => p.id == id)
        
        if (idx === -1) return alert('文章未找到')
        
        posts[idx].content = htmlContent
        savePosts(posts)
        
        if (token) {
            try {
                const res = await uploadFileToRepo(posts[idx], token)
                posts[idx].repoSha = res.sha
                posts[idx].repoPath = res.path
                savePosts(posts)
                alert('保存并同步成功！')
            } catch (e) {
                alert('远程同步失败：' + e.message)
                console.warn(e)
                return
            }
        } else {
            alert('保存成功！（未同步到远程）')
        }
        
        location.hash = 'post-' + id
    })

    document.getElementById('cancel-md').addEventListener('click', () => {
        location.hash = 'post-' + id
    })
    
    document.getElementById('admin-md').addEventListener('click', () => {
        openEditor({ mode: 'edit', post })
    })

    document.getElementById('delete-md').addEventListener('click', async () => {
        if (!confirm('确定要删除这篇文章吗？此操作不可恢复！')) return
        
        const token = document.getElementById('edit-token').value.trim()
        const posts = getPosts()
        const idx = posts.findIndex(p => p.id == id)
        
        if (idx === -1) return alert('文章未找到')

        if (post.repoPath && token) {
            try {
                await deleteFileFromRepo(posts[idx], token)
                posts.splice(idx, 1)
                savePosts(posts)
                alert('删除成功（包括远程文件）')
            } catch (e) {
                alert('远程删除失败：' + e.message)
                console.warn(e)
                return
            }
        } else {
            posts.splice(idx, 1)
            savePosts(posts)
            alert('删除成功')
        }

        location.hash = 'categories'
    })
}

// 文章阅读页面
function renderPostDetail(id) {
    const p = getPosts().find(x => x.id == id) || { title: '未找到', desc: '', content: '' }
    
    const renderedContent = p.content || '<p>暂无内容</p>'
    
    document.getElementById('app').innerHTML = `<section class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
            <h2 class="pd-title">${escapeHtml(p.title)}</h2>
            <div><button id="jump-edit" style="padding:6px 12px;border-radius:6px;cursor:pointer">编辑</button></div>
        </div>
        <p class="pd-desc">${escapeHtml(p.desc)}</p>
        <hr/>
        <div class="pd-content ql-editor">${renderedContent}</div>
    </section>`
    
    const jumpBtn = document.getElementById('jump-edit')
    if (jumpBtn) jumpBtn.addEventListener('click', () => { location.hash = 'edit-' + id })
    
    if ((!p.content || p.content.trim() === '') && p.repoPath) {
        const contentEl = document.querySelector('.pd-content')
        if (contentEl) {
            contentEl.innerHTML = '<p>正在从远端加载文章内容……</p>'
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
                    contentEl.innerHTML = '<p>无法加载远端内容</p>'
                }
            }).catch(e => {
                console.error('Failed to fetch remote content:', e)
                contentEl.innerHTML = '<p>加载失败</p>'
            })
        }
    }
}

// 路由
function router() {
    const hash = location.hash.replace('#', '') || 'home'
    if (hash.startsWith('edit-')) return renderEditPage(hash.replace('edit-', ''))
    if (hash.startsWith('post-')) return renderPostDetail(hash.replace('post-', ''))
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

function renderCategories(root, selectedCat) {
    root.innerHTML = `<section class="card">
        <div style="display:flex;justify-content:space-between;align-items:center">
            <h2>${t('categories.title')}</h2>
            <div><button id="addArticleBtn">发布文章</button></div>
        </div>
        <div class="categories">
            <button class="cat-btn" data-cat="all">全部</button>
            ${categories.map(c => `<button class="cat-btn" data-cat="${c}">${c}</button>`).join('')}
        </div>
        <div id="posts" class="posts-grid"></div>
    </section>`

    document.querySelectorAll('.cat-btn').forEach(btn => btn.addEventListener('click', e => {
        const catKey = e.currentTarget.dataset.cat
        location.hash = 'categories-' + encodeURIComponent(catKey)
    }))

    document.getElementById('addArticleBtn').addEventListener('click', () => openEditor({ mode: 'create', type: 'article' }))

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
    el.innerHTML = posts.map(p => `<div class="post card" data-id="${p.id}">
        <img src="${p.cover || 'https://via.placeholder.com/320x180'}" alt="${escapeHtml(p.title)}">
        <div>
            <h4 class="post-title">${escapeHtml(p.title)}</h4>
            <p class="post-desc">${escapeHtml(p.desc)}</p>
        </div>
        <div style="margin-left:auto">
            <button class="edit-post" data-id="${p.id}">编辑</button>
            <button class="del-post" data-id="${p.id}">删除</button>
        </div>
    </div>`).join('')

    document.querySelectorAll('#posts .post').forEach(card => card.addEventListener('click', e => {
        const id = card.dataset.id
        location.hash = 'post-' + id
    }))

    document.querySelectorAll('#posts .edit-post').forEach(b => b.addEventListener('click', e => {
        e.stopPropagation()
        const id = +e.currentTarget.dataset.id
        const post = getPosts().find(p => p.id === id)
        openEditor({ mode: 'edit', post })
    }))
    
    document.querySelectorAll('#posts .del-post').forEach(b => b.addEventListener('click', e => {
        e.stopPropagation()
        const id = +e.currentTarget.dataset.id
        deletePost(id)
    }))
}

function renderBoard(root) {
    root.innerHTML = `<section class="card">
        <h2>${t('board.title')}</h2>
        <div class="board-form">
            <input id="nick" placeholder="${t('board.nick')}" />
            <input id="pwd" placeholder="${t('board.pwd')}" style="width:180px;" />
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
    box.innerHTML = msgs.map((m, idx) => `<div class="message">
        <div>
            <strong>${escapeHtml(m.nick || '访客')}</strong> 
            <small>${new Date(m.t).toLocaleString()}</small> 
            <button data-idx="${idx}" class="del-btn">删除</button>
        </div>
        <div>${escapeHtml(m.text)}</div>
    </div>`).join('')

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

function tryDelete(idx) {
    const msgs = JSON.parse(localStorage.getItem('myblog_msgs') || '[]')
    const m = msgs[idx]
    if (!m) return alert('留言不存在')
    const input = prompt('请输入删除密码：')
    if (input === null) return
    if (input === MASTER || (m.pwd && input === m.pwd)) {
        msgs.splice(idx, 1)
        localStorage.setItem('myblog_msgs', JSON.stringify(msgs))
        loadMessages()
        return alert('删除成功')
    }
    alert('密码错误，无法删除')
}

function openEditor({ mode = 'create', type = 'article', post = null } = {}) {
    const backdrop = document.createElement('div')
    backdrop.className = 'modal-backdrop'
    const modal = document.createElement('div')
    modal.className = 'modal'
    modal.innerHTML = `
        <div><strong>${mode === 'create' ? '发布文章' : '编辑文章'}</strong></div>
        <div class="row"><label>封面</label><input id="ed-cover" type="url" placeholder="封面图片地址 (可选)"></div>
        <div class="row"><label>标题</label><input id="ed-title" type="text" placeholder="文章标题"></div>
        <div class="row"><label>简介</label><input id="ed-desc" type="text" placeholder="文章简介"></div>
        <div class="row"><label>分类</label><select id="ed-cat">${categories.map(c => `<option>${c}</option>`).join('')}</select></div>
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
    const title = modal.querySelector('#ed-title')
    const desc = modal.querySelector('#ed-desc')
    const cat = modal.querySelector('#ed-cat')
    const pwd = modal.querySelector('#ed-pwd')
    
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

    modal.querySelector('#ed-open-full').addEventListener('click', () => {
        const provided = pwd.value || ''
        if (provided !== MASTER) return alert('密码错误：需要主密码以发布/编辑文章')
        
        if (mode === 'create') {
            const id = Date.now()
            const newPost = {
                id,
                type: 'article',
                cover: cover.value.trim(),
                title: title.value.trim(),
                desc: desc.value.trim(),
                category: cat.value,
                content: ''
            }
            const posts = getPosts()
            posts.unshift(newPost)
            savePosts(posts)
            document.body.removeChild(backdrop)
            location.hash = 'edit-' + id
        } else {
            const posts = getPosts()
            const idx = posts.findIndex(p => p.id === post.id)
            if (idx === -1) return alert('文章未找到')
            posts[idx].cover = cover.value.trim()
            posts[idx].title = title.value.trim()
            posts[idx].desc = desc.value.trim()
            posts[idx].category = cat.value
            savePosts(posts)
            document.body.removeChild(backdrop)
            location.hash = 'edit-' + post.id
        }
    })

    modal.querySelector('#ed-save').addEventListener('click', () => {
        const provided = pwd.value || ''
        if (provided !== MASTER) return alert('密码错误：需要主密码以发布/编辑文章')
        
        const posts = getPosts()
        
        if (mode === 'create') {
            const id = Date.now()
            const newPost = {
                id,
                type: 'article',
                cover: cover.value.trim(),
                title: title.value.trim(),
                desc: desc.value.trim(),
                category: cat.value,
                content: ''
            }
            posts.unshift(newPost)
            savePosts(posts)
        } else {
            const idx = posts.findIndex(p => p.id === post.id)
            if (idx === -1) return alert('原文章未找到')
            posts[idx].cover = cover.value.trim()
            posts[idx].title = title.value.trim()
            posts[idx].desc = desc.value.trim()
            posts[idx].category = cat.value
            savePosts(posts)
        }
        
        document.body.removeChild(backdrop)
        router()
    })
}

async function deletePost(id) {
    const input = prompt('请输入主密码以删除文章：')
    if (input === null) return
    if (input !== MASTER) return alert('密码错误')
    
    const posts = getPosts()
    const idx = posts.findIndex(p => p.id === id)
    if (idx === -1) return alert('文章不存在')
    
    posts.splice(idx, 1)
    savePosts(posts)
    alert('删除成功')
    router()
}

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
    document.getElementById('langBtn').addEventListener('click', () => {
        currentLang = currentLang === 'zh' ? 'en' : 'zh'
        document.getElementById('langBtn').innerText = currentLang === 'zh' ? 'EN' : '中文'
        router()
        document.querySelectorAll('.nav-item').forEach(a => {
            const k = a.dataset.key
            a.innerText = t(k)
        })
    })

    document.querySelectorAll('.nav-item').forEach(a => {
        const k = a.dataset.key
        a.innerText = t(k)
    })
    
    setBackground()
    window.addEventListener('hashchange', router)
    router()
})

