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

// 多语言文案
const i18n = {
    zh: {
        'nav.home': '首页', 'nav.projects': '项目', 'nav.categories': '分类', 'nav.board': '留言板',
        'home.title': '关于我', 'home.contact': '联系方式', 'projects.title': '我的项目',
        'categories.title': '分类', 'board.title': '留言板', 'board.placeholder': '请输入留言', 'board.nick': '请输入昵称', 'board.pwd': '请输入密码(用于删除留言)', 'board.post': '发布'
    },
    en: {
        'nav.home': 'Home', 'nav.projects': 'Projects', 'nav.categories': 'Categories', 'nav.board': 'Board',
        'home.title': 'About Me', 'home.contact': 'Contact', 'projects.title': 'Projects',
        'categories.title': 'Categories', 'board.title': 'Message Board', 'board.placeholder': 'Please enter a message', 'board.nick': 'Please enter a nickname', 'board.pwd': 'Enter password (for deletion)', 'board.post': 'Post'
    }
}

let currentLang = 'zh'

function t(key) { return (i18n[currentLang] && i18n[currentLang][key]) || key }

function setBackground() {
    if (BG_IMAGE && BG_IMAGE.trim()) { document.documentElement.style.setProperty('--bg-url', `url('${BG_IMAGE}')`) }
}

// Sample data: 用户可在此替换或由后端填充
const sampleProjects = [
    { id: 1, title: '示例项目 A', desc: '项目简介示例。', icon: '' },
    { id: 2, title: '示例项目 B', desc: '项目简介示例。', icon: '' }
]

const categories = ['随笔', '编程技术', '算法', '计算机知识', '英语', '数学']

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
    renderPage(hash)
}

function renderPage(page) {
    const app = document.getElementById('app')
    if (page === 'home') renderHome(app)
    else if (page === 'projects') renderProjects(app)
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

function renderProjects(root) {
    root.innerHTML = `<section class="card"><h2>${t('projects.title')}</h2><div class="projects-grid">${sampleProjects.map(p => `
        <div class="project-card">
            <img src="${p.icon || 'https://via.placeholder.com/80'}" alt="icon">
            <div>
                <a href="#project-${p.id}" class="proj-link">${p.title}</a>
                <p class="proj-desc">${p.desc}</p>
            </div>
        </div>
    `).join('')}</div></section>`

    // 点击项目跳转到独立页面
    document.querySelectorAll('.proj-link').forEach(a => a.addEventListener('click', e => {
        e.preventDefault(); const id = e.target.getAttribute('href').replace('#project-', ''); renderProjectDetail(id)
    }))

    // 自动翻译项目标题与简介（非留言板）
    if (currentLang === 'en') {
        sampleProjects.forEach((p, i) => {
            translateText(p.title, 'en').then(tt => {
                const a = document.querySelectorAll('.proj-link')[i]
                if (a) a.innerText = tt
            })
            translateText(p.desc, 'en').then(td => {
                const ps = document.querySelectorAll('.projects-grid .proj-desc')
                if (ps[i]) ps[i].innerText = td
            })
        })
    }
}

function renderProjectDetail(id) {
    const p = sampleProjects.find(x => x.id == id) || { title: '未找到', desc: '' }
    document.getElementById('app').innerHTML = `<section class="card"><a href="#projects">← 返回</a><h2 class="pd-title">${p.title}</h2><p class="pd-desc">${p.desc}</p></section>`
    if (currentLang === 'en') {
        translateText(p.title, 'en').then(tt => { const el = document.querySelector('.pd-title'); if (el) el.innerText = tt })
        translateText(p.desc, 'en').then(td => { const el = document.querySelector('.pd-desc'); if (el) el.innerText = td })
    }
}

function renderCategories(root) {
    root.innerHTML = `<section class="card"><h2>${t('categories.title')}</h2>
    <div class="categories">${categories.map((c, i) => `<button class="cat-btn" data-cat="${i}">${c}</button>`).join('')}</div>
    <div id="posts" class="posts-grid"></div>
  </section>`

    document.querySelectorAll('.cat-btn').forEach(btn => btn.addEventListener('click', e => {
        const idx = +e.currentTarget.dataset.cat; renderPostsForCategory(categories[idx])
    }))
}

function renderPostsForCategory(cat) {
    // 示例两篇文章，用户可替换为真实数据
    const posts = [
        { title: `${cat} 示例文章 1`, desc: '文章简介示例。', cover: 'https://via.placeholder.com/320x180' },
        { title: `${cat} 示例文章 2`, desc: '文章简介示例。', cover: 'https://via.placeholder.com/320x180' },
        { title: `${cat} 示例文章 3`, desc: '文章简介示例。', cover: 'https://via.placeholder.com/320x180' },
    ]
    const el = document.getElementById('posts')
    el.innerHTML = posts.map(p => `<div class="post card"><img src="${p.cover}"><div><h4 class="post-title">${p.title}</h4><p class="post-desc">${p.desc}</p></div></div>`).join('')
    if (currentLang === 'en') {
        posts.forEach((p, i) => {
            translateText(p.title, 'en').then(tt => { const tEls = document.querySelectorAll('#posts .post-title'); if (tEls[i]) tEls[i].innerText = tt })
            translateText(p.desc, 'en').then(td => { const dEls = document.querySelectorAll('#posts .post-desc'); if (dEls[i]) dEls[i].innerText = td })
        })
    }
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

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[ch])) }

// 绑定语言切换
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
