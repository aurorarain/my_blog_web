// Service Worker for caching static assets
const CACHE_VERSION = '1.1.0'
const CACHE_NAME = 'myblog-v' + CACHE_VERSION
const STATIC_CACHE = [
    './styles.css',
    './app.js',
    './background.png',
    './my_photo.png'
]

// Install event - cache static assets (excluding HTML)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Caching static assets')
                return cache.addAll(STATIC_CACHE.map(url => new Request(url, { cache: 'reload' })))
            })
            .catch(err => {
                console.warn('Cache install failed:', err)
            })
    )
    self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName)
                        return caches.delete(cacheName)
                    }
                })
            )
        })
    )
    self.clients.claim()
})

// 支持页面向 Service Worker 发送消息以立即激活新版本
self.addEventListener('message', event => {
    try {
        const data = event.data || {}
        if (data.type === 'SKIP_WAITING') {
            self.skipWaiting()
        }
    } catch (e) {
        console.warn('SW message handler error', e)
    }
})

// Fetch event - optimized caching strategy
self.addEventListener('fetch', event => {
    const { request } = event
    const url = new URL(request.url)

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return
    }

    // Skip API requests
    if (url.pathname.includes('/api/') || url.hostname.includes('supabase.co') || url.hostname.includes('github')) {
        return
    }

    // Network ONLY strategy for HTML files - always fetch fresh
    if (request.headers.get('accept')?.includes('text/html') || url.pathname.endsWith('.html') || url.pathname === '/' || url.pathname === './') {
        event.respondWith(
            fetch(request, { cache: 'no-store' })
                .then(response => {
                    // Don't cache HTML at all
                    return response
                })
                .catch(err => {
                    console.error('Failed to fetch HTML:', err)
                    // Return a basic error page instead of cached version
                    return new Response('<h1>网络错误</h1><p>无法加载页面，请检查网络连接</p>', {
                        headers: { 'Content-Type': 'text/html; charset=utf-8' }
                    })
                })
        )
        return
    }

    // Stale-while-revalidate strategy for CSS/JS - show cached, update in background
    if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js')) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(request).then(cachedResponse => {
                    const fetchPromise = fetch(request, { cache: 'reload' })
                        .then(networkResponse => {
                            if (networkResponse && networkResponse.status === 200) {
                                cache.put(request, networkResponse.clone())
                            }
                            return networkResponse
                        })
                        .catch(err => {
                            console.warn('Failed to fetch:', url.pathname, err)
                            return cachedResponse
                        })

                    // Return cached immediately, update in background
                    return cachedResponse || fetchPromise
                })
            })
        )
        return
    }

    // Cache first strategy for images - they rarely change
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
        event.respondWith(
            caches.match(request)
                .then(response => {
                    if (response) {
                        return response
                    }

                    return fetch(request).then(response => {
                        if (response && response.status === 200) {
                            const responseToCache = response.clone()
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, responseToCache)
                            })
                        }
                        return response
                    })
                })
        )
        return
    }

    // Default: network first for everything else
    event.respondWith(
        fetch(request)
            .catch(() => caches.match(request))
    )
})

