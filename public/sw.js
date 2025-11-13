// Auto-increment version on each deployment to force cache clear
const CACHE_NAME = 'arham-stationary-v' + new Date().getTime()
const urlsToCache = [
  '/',
  '/products',
  '/cart',
  '/checkout',
  '/contact',
  '/admin/login',
  '/admin/dashboard',
  '/admin/pos',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('fetch', (event) => {
  // Only handle GET requests - POST, PUT, DELETE, HEAD, etc. cannot be cached
  if (event.request.method !== 'GET') {
    return // Let the browser handle non-GET requests normally
  }

  // Don't cache API requests or external resources
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/api/') || 
      url.origin !== self.location.origin ||
      event.request.headers.get('accept')?.includes('application/json')) {
    return // Let the browser handle API requests normally
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if available
      if (response) {
        return response
      }

      // Fetch from network
      return fetch(event.request).then((response) => {
        // Only cache successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response
        }

        // Clone the response before caching
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })
        return response
      }).catch(() => {
        // If fetch fails and no cache, return offline page or fallback
        return caches.match('/')
      })
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Delete ALL old caches to force fresh load
      return Promise.all(
        cacheNames.map((cacheName) => {
          console.log('Deleting old cache:', cacheName)
          return caches.delete(cacheName)
        })
      )
    }).then(() => {
      // Force claim all clients to use new service worker immediately
      return self.clients.claim()
    })
  )
})

