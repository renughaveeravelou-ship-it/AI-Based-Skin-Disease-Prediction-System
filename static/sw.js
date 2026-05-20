const CACHE_NAME = 'dermshield-v1';
const ASSETS = [
  '/',
  '/static/js/main.js',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap'
];

// Install Event
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static files');
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Event
self.addEventListener('activate', (e) => {
  console.log('[Service Worker] Activated');
});

// Fetch Event - network first, fallback to cache
self.addEventListener('fetch', (e) => {
  // Avoid caching predictions, downloads, database routes
  if (e.request.url.includes('/predict') || e.request.url.includes('/login') || e.request.url.includes('/register') || e.request.url.includes('/download_report') || e.request.url.includes('/chatbot')) {
    return;
  }
  
  e.respondWith(
    fetch(e.request)
      .catch(() => caches.match(e.request))
  );
});
