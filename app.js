// 配置区：将下面的 BG_IMAGE、USER_* 替换为你的内容
const BG_IMAGE = '' // 在这里填入背景图地址，例如 'https://example.com/bg.jpg'
const USER_PHOTO = '' // 个人照片地址
const USER_NAME = '你的名字'
const USER_BIO = '在此写入个人简介。可以包含职业、技能、经验等简短描述。'
const USER_CONTACT = [
    { type: 'Email', value: 'you@example.com' },
    { type: 'GitHub', value: 'https://github.com/yourname' }
]

// 多语言文案
const i18n = {
    zh: {
        'nav.home': '首页', 'nav.projects': '项目', 'nav.categories': '分类', 'nav.board': '留言板',
        'home.title': '关于我', 'home.contact': '联系方式', 'projects.title': '我的项目',
        'categories.title': '分类', 'board.title': '留言板', 'board.placeholder': '输入留言内容...', 'board.nick': '昵称（可留空）', 'board.post': '发布'
    },
    en: {
        'nav.home': 'Home', 'nav.projects': 'Projects', 'nav.categories': 'Categories', 'nav.board': 'Board',
        'home.title': 'About Me', 'home.contact': 'Contact', 'projects.title': 'Projects',
        'categories.title': 'Categories', 'board.title': 'Message Board', 'board.placeholder': 'Write a message...', 'board.nick': 'Nickname (optional)', 'board.post': 'Post'
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
    root.innerHTML = `
    <section class="card home-grid">
      <img class="avatar" src="${USER_PHOTO || 'https://via.placeholder.com/400x400?text=Photo'}" alt="avatar">
      <div>
        <h2>${USER_NAME}</h2>
        <p>${USER_BIO}</p>
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
        <p>${p.desc}</p>
      </div>
    </div>
  `).join('')}</div></section>`

    // 点击项目跳转到独立页面
    document.querySelectorAll('.proj-link').forEach(a => a.addEventListener('click', e => {
        e.preventDefault(); const id = e.target.getAttribute('href').replace('#project-', ''); renderProjectDetail(id)
    }))
}

function renderProjectDetail(id) {
    const p = sampleProjects.find(x => x.id == id) || { title: '未找到', desc: '' }
    document.getElementById('app').innerHTML = `<section class="card"><a href="#projects">← 返回</a><h2>${p.title}</h2><p>${p.desc}</p></section>`
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
    el.innerHTML = posts.map(p => `<div class="post card"><img src="${p.cover}"><div><h4>${p.title}</h4><p>${p.desc}</p></div></div>`).join('')
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
