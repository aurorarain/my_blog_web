// Service Worker for caching static assets
const CACHE_VERSION = '1.0.1'
const CACHE_NAME = 'myblog-v' + CACHE_VERSION
const STATIC_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './background.png',
    './my_photo.png'
]

// Install event - cache static assets
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

// Fetch event - network first for HTML, cache first for assets
self.addEventListener('fetch', event => {
    const { request } = event
    const url = new URL(request.url)
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return
    }
    
    // Skip API requests
    if (url.pathname.includes('/api/') || url.hostname.includes('github')) {
        return
    }
    
    // Network first strategy for HTML files
    if (request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const responseToCache = response.clone()
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache)
                    })
                    return response
                })
                .catch(() => {
                    return caches.match(request)
                })
        )
        return
    }
    
    // Cache first strategy for other assets
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response
                }
                
                return fetch(request).then(response => {
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response
                    }
                    
                    const responseToCache = response.clone()
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache)
                    })
                    
                    return response
                })
            })
            .catch(() => {
                return caches.match('./index.html')
            })
    )
})

