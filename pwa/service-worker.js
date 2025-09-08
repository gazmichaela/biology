// === KONFIGURACE === // 
const CONFIG = {
  version: '2.1.0',
  cachePrefix: 'systemova-biologie',
  maxAge: {
    pages: 1000 * 60 * 60 * 24 * 7,      // 7 dní pro stránky
    assets: 1000 * 60 * 60 * 24 * 30,     // 30 dní pro assety
    images: 1000 * 60 * 60 * 24 * 90,     // 90 dní pro obrázky
    api: 1000 * 60 * 5                    // 5 minut pro API
  },
  maxEntries: {
    pages: 50,
    assets: 100,
    images: 60,
    runtime: 30
  }
};

// Cache názvy
const CACHE_NAMES = {
  core: `${CONFIG.cachePrefix}-core-v${CONFIG.version}`,
  pages: `${CONFIG.cachePrefix}-pages-v${CONFIG.version}`,
  assets: `${CONFIG.cachePrefix}-assets-v${CONFIG.version}`,
  images: `${CONFIG.cachePrefix}-images-v${CONFIG.version}`,
  runtime: `${CONFIG.cachePrefix}-runtime-v${CONFIG.version}`,
  api: `${CONFIG.cachePrefix}-api-v${CONFIG.version}`
};

// Core soubory - nejdůležitější pro offline funkcionalitu
const CORE_FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/navigation-desktop.css',
  './css/navigation-mobile.css',
  './js/dark-mode.js',
  './js/cookies.js',
  './favicon/web-logo-192x192.png'
];

// Stránky pro pre-cache
const PAGES_TO_CACHE = [
  './system.html',
  './system-introduction.html',
  './system-approach.html',
  './system-thinking.html',
  './system-theory.html',
  './life.html',
  './life-properties.html',
  './life-origin.html',
  './cell.html',
  './human.html',
  './personal-data.html',
  './sidemap.html'
];

// Assety pro pre-cache
const ASSETS_TO_CACHE = [
  './css/img.css',
  './css/responsiveness.css',
  './js/dropdowns.js',
  './js/active-menu.js',
  './js/source.js',
  './js/sticky-header.js',
  './js/responsiveness.js',
  './favicon/web-logo-180x180-apple-touch.png',
  './favicon/web-logo-120x120-apple-touch.png',
  './favicon/web-logo-32x32.png',
  './favicon/web-logo-64x64-48x48-32x32-16x16.ico'
];

// === UTILITY FUNKCE ===

// Logging s timestamp
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[SW ${timestamp}] ${message}`, data || '');
}

// Error logging
function logError(message, error) {
  const timestamp = new Date().toISOString();
  console.error(`[SW ERROR ${timestamp}] ${message}`, error);
}

// Kontrola, jestli je request cacheable
function isCacheable(request) {
  const url = new URL(request.url);
  
  // Pouze GET requesty
  if (request.method !== 'GET') return false;
  
  // Ignore chrome-extension, moz-extension atd.
  if (!url.protocol.startsWith('http')) return false;
  
  // Ignore URL s query parametry (kromě vybraných)
  if (url.search && !url.search.includes('v=') && !url.search.includes('version=')) {
    return false;
  }
  
  return true;
}

// Určí cache strategii podle URL
function getCacheStrategy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // API calls
  if (pathname.includes('/api/') || pathname.includes('api.')) {
    return { name: CACHE_NAMES.api, strategy: 'networkFirst', maxAge: CONFIG.maxAge.api };
  }
  
  // Images
  if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    return { name: CACHE_NAMES.images, strategy: 'cacheFirst', maxAge: CONFIG.maxAge.images };
  }
  
  // CSS, JS, fonts
  if (pathname.match(/\.(css|js|woff|woff2|ttf|eot)$/i)) {
    return { name: CACHE_NAMES.assets, strategy: 'cacheFirst', maxAge: CONFIG.maxAge.assets };
  }
  
  // HTML stránky
  if (pathname.endsWith('.html') || pathname === '/' || !pathname.includes('.')) {
    return { name: CACHE_NAMES.pages, strategy: 'staleWhileRevalidate', maxAge: CONFIG.maxAge.pages };
  }
  
  // Runtime cache pro ostatní
  return { name: CACHE_NAMES.runtime, strategy: 'networkFirst', maxAge: CONFIG.maxAge.assets };
}

// Čištění starých cache entrit
async function cleanupCache(cacheName, maxEntries, maxAge) {
  try {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    
    if (requests.length <= maxEntries) return;
    
    // Seřaď podle času (starší první)
    const requestsWithTime = await Promise.all(
      requests.map(async request => {
        const response = await cache.match(request);
        const dateHeader = response?.headers.get('date');
        const time = dateHeader ? new Date(dateHeader).getTime() : 0;
        return { request, time };
      })
    );
    
    requestsWithTime.sort((a, b) => a.time - b.time);
    
    // Smaž nejstarší entrys
    const toDelete = requestsWithTime.slice(0, requests.length - maxEntries);
    await Promise.all(toDelete.map(item => cache.delete(item.request)));
    
    log(`Vyčistil jsem ${toDelete.length} starých entrit z ${cacheName}`);
  } catch (error) {
    logError(`Chyba při čištění cache ${cacheName}:`, error);
  }
}

// Přidá timestamp do response headers
function addTimestamp(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', new Date().toISOString());
  headers.set('sw-version', CONFIG.version);
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}

// === CACHE STRATEGIE ===

// Cache First - nejdřív cache, pak síť
async function cacheFirst(request, cacheConfig) {
  try {
    const cache = await caches.open(cacheConfig.name);
    const cached = await cache.match(request);
    
    if (cached) {
      // Zkontroluj stáří
      const cachedAt = cached.headers.get('sw-cached-at');
      if (cachedAt) {
        const age = Date.now() - new Date(cachedAt).getTime();
        if (age < cacheConfig.maxAge) {
          log(`Cache hit (${cacheConfig.name}):`, request.url);
          return cached;
        }
      }
    }
    
    // Fetch ze sítě
    log(`Network fetch (${cacheConfig.name}):`, request.url);
    const response = await fetch(request.clone());
    
    if (response.ok) {
      const responseToCache = addTimestamp(response.clone());
      await cache.put(request, responseToCache);
      await cleanupCache(cacheConfig.name, CONFIG.maxEntries[cacheConfig.name.split('-')[2]] || 30, cacheConfig.maxAge);
    }
    
    return response;
  } catch (error) {
    // Fallback na cache i když je stará
    const cache = await caches.open(cacheConfig.name);
    const cached = await cache.match(request);
    if (cached) {
      log(`Fallback cache hit (${cacheConfig.name}):`, request.url);
      return cached;
    }
    throw error;
  }
}

// Network First - nejdřív síť, pak cache
async function networkFirst(request, cacheConfig) {
  try {
    log(`Network first attempt (${cacheConfig.name}):`, request.url);
    const response = await fetch(request.clone());
    
    if (response.ok) {
      const cache = await caches.open(cacheConfig.name);
      const responseToCache = addTimestamp(response.clone());
      await cache.put(request, responseToCache);
      await cleanupCache(cacheConfig.name, CONFIG.maxEntries[cacheConfig.name.split('-')[2]] || 30, cacheConfig.maxAge);
    }
    
    return response;
  } catch (error) {
    log(`Network failed, trying cache (${cacheConfig.name}):`, request.url);
    const cache = await caches.open(cacheConfig.name);
    const cached = await cache.match(request);
    
    if (cached) {
      log(`Cache fallback hit (${cacheConfig.name}):`, request.url);
      return cached;
    }
    
    throw error;
  }
}

// Stale While Revalidate - cache okamžitě, update na pozadí
async function staleWhileRevalidate(request, cacheConfig) {
  const cache = await caches.open(cacheConfig.name);
  const cached = await cache.match(request);
  
  // Fetch na pozadí (bez čekání)
  const networkPromise = fetch(request.clone())
    .then(response => {
      if (response.ok) {
        const responseToCache = addTimestamp(response.clone());
        cache.put(request, responseToCache);
        cleanupCache(cacheConfig.name, CONFIG.maxEntries[cacheConfig.name.split('-')[2]] || 30, cacheConfig.maxAge);
      }
      return response;
    })
    .catch(error => {
      logError(`Stale-while-revalidate fetch failed for ${request.url}:`, error);
    });
  
  // Vrať cache okamžitě (pokud existuje)
  if (cached) {
    log(`Stale cache hit (${cacheConfig.name}):`, request.url);
    return cached;
  }
  
  // Jinak počkej na síť
  log(`No cache, waiting for network (${cacheConfig.name}):`, request.url);
  return networkPromise;
}

// === SERVICE WORKER EVENTS ===

// Install event
self.addEventListener('install', event => {
  log('Service Worker instaluji...', `verze ${CONFIG.version}`);
  
  event.waitUntil(
    (async () => {
      try {
        // Pre-cache core files
        const coreCache = await caches.open(CACHE_NAMES.core);
        await coreCache.addAll(CORE_FILES);
        log('Core files cachovány');
        
        // Pre-cache pages
        const pagesCache = await caches.open(CACHE_NAMES.pages);
        await pagesCache.addAll(PAGES_TO_CACHE);
        log('Pages cachovány');
        
        // Pre-cache assets
        const assetsCache = await caches.open(CACHE_NAMES.assets);
        await assetsCache.addAll(ASSETS_TO_CACHE);
        log('Assets cachovány');
        
        log('Service Worker instalace dokončena');
        
        // Aktivuj okamžitě
        await self.skipWaiting();
        
      } catch (error) {
        logError('Chyba při instalaci:', error);
        throw error;
      }
    })()
  );
});

// Activate event
self.addEventListener('activate', event => {
  log('Service Worker aktivuji...', `verze ${CONFIG.version}`);
  
  event.waitUntil(
    (async () => {
      try {
        // Smaž staré cache verze
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => 
          name.startsWith(CONFIG.cachePrefix) && 
          !Object.values(CACHE_NAMES).includes(name)
        );
        
        if (oldCaches.length > 0) {
          await Promise.all(oldCaches.map(name => caches.delete(name)));
          log('Staré cache smazány:', oldCaches);
        }
        
        // Převezmi kontrolu
        await self.clients.claim();
        
        // Pošli update zprávu všem clientům
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            version: CONFIG.version,
            timestamp: new Date().toISOString()
          });
        });
        
        log('Service Worker aktivace dokončena');
        
      } catch (error) {
        logError('Chyba při aktivaci:', error);
      }
    })()
  );
});

// Fetch event - hlavní logika
self.addEventListener('fetch', event => {
  // Pouze cacheable requesty
  if (!isCacheable(event.request)) {
    return;
  }
  
  const cacheConfig = getCacheStrategy(event.request);
  
  event.respondWith(
    (async () => {
      try {
        // Vyber strategii
        switch (cacheConfig.strategy) {
          case 'cacheFirst':
            return await cacheFirst(event.request, cacheConfig);
          case 'networkFirst':
            return await networkFirst(event.request, cacheConfig);
          case 'staleWhileRevalidate':
            return await staleWhileRevalidate(event.request, cacheConfig);
          default:
            return await networkFirst(event.request, cacheConfig);
        }
        
      } catch (error) {
        logError(`Fetch failed for ${event.request.url}:`, error);
        
        // Offline fallback pro HTML stránky
        if (event.request.destination === 'document') {
          const cache = await caches.open(CACHE_NAMES.core);
          const offlinePage = await cache.match('./index.html');
          if (offlinePage) {
            return offlinePage;
          }
          
          // Ultimate fallback
          return new Response(
            generateOfflineHTML(event.request.url),
            {
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-store'
              }
            }
          );
        }
        
        // Pro ostatní typy vrať error
        return new Response('Offline - soubor není k dispozici', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      }
    })()
  );
});

// Background sync (pokud je podporován)
self.addEventListener('sync', event => {
  log('Background sync:', event.tag);
  
  if (event.tag === 'background-sync-cache-cleanup') {
    event.waitUntil(
      (async () => {
        // Vyčisti všechny cache
        for (const [key, cacheName] of Object.entries(CACHE_NAMES)) {
          const maxEntries = CONFIG.maxEntries[key] || 30;
          const maxAge = CONFIG.maxAge[key] || CONFIG.maxAge.assets;
          await cleanupCache(cacheName, maxEntries, maxAge);
        }
        log('Background cache cleanup dokončen');
      })()
    );
  }
});

// Push notifications
self.addEventListener('push', event => {
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Systémová biologie', {
        body: data.body || 'Nový obsah je k dispozici',
        icon: './favicon/web-logo-192x192.png',
        badge: './favicon/web-logo-32x32.png',
        data: data.url || './',
        actions: [
          {
            action: 'open',
            title: 'Otevřít',
            icon: './favicon/web-logo-32x32.png'
          }
        ]
      })
    );
    
    log('Push notifikace zobrazena:', data);
  } catch (error) {
    logError('Chyba při zobrazení push notifikace:', error);
  }
});

// Notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  const url = event.notification.data || './';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      // Najdi existující okno
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otevři nové okno
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
  
  log('Notification clicked, opening:', url);
});

// Messages od main thread
self.addEventListener('message', event => {
  const { type, data } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      log('Received SKIP_WAITING message');
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: CONFIG.version });
      break;
      
    case 'CLEAR_CACHE':
      event.waitUntil(
        (async () => {
          const cacheName = data?.cacheName;
          if (cacheName && Object.values(CACHE_NAMES).includes(cacheName)) {
            await caches.delete(cacheName);
            log(`Cache ${cacheName} smazána na požádání`);
          }
        })()
      );
      break;
      
    case 'GET_CACHE_STATUS':
      event.waitUntil(
        (async () => {
          const status = {};
          for (const [key, name] of Object.entries(CACHE_NAMES)) {
            try {
              const cache = await caches.open(name);
              const keys = await cache.keys();
              status[key] = {
                name,
                entries: keys.length,
                urls: keys.slice(0, 10).map(req => req.url) // První 10 URL
              };
            } catch (error) {
              status[key] = { error: error.message };
            }
          }
          event.ports[0]?.postMessage({ cacheStatus: status });
        })()
      );
      break;
      
    default:
      log('Unknown message type:', type);
  }
});

// Utility: Generuje offline HTML
function generateOfflineHTML(requestUrl) {
  return `
    <!DOCTYPE html>
    <html lang="cs">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Systémová biologie</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          background: linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%);
          color: #023f1e;
          margin: 0;
          padding: 20px;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .offline-container {
          background: white;
          padding: 40px;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          max-width: 500px;
          width: 100%;
        }
        h1 {
          color: #3f7093;
          margin-bottom: 20px;
          font-size: 2em;
        }
        .icon {
          font-size: 4em;
          margin-bottom: 20px;
          opacity: 0.7;
        }
        button {
          background: #3f7093;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 16px;
          margin: 10px;
          transition: background 0.3s;
        }
        button:hover {
          background: #2d5c7a;
        }
        .url {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 5px;
          font-family: monospace;
          font-size: 14px;
          margin: 20px 0;
          word-break: break-all;
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="icon">📡</div>
        <h1>Jste offline</h1>
        <p>Stránka <span class="url">${requestUrl}</span> není dostupná bez připojení k internetu.</p>
        <p>Zkontrolujte připojení a zkuste to znovu, nebo se vraťte na hlavní stránku.</p>
        
        <button onclick="window.location.reload()"> Zkusit znovu</button>
        <button onclick="window.location.href='./'"> Hlavní stránka</button>
        <button onclick="window.history.back()">← Zpět</button>
        
        <p style="margin-top: 30px; font-size: 14px; opacity: 0.7;">
          Service Worker v${CONFIG.version}
        </p>
      </div>
    </body>
    </html>
  `;
}

// Performance monitoring
let performanceMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  networkRequests: 0,
  errors: 0
};

// Periodic cleanup (každých 24 hodin)
setInterval(() => {
  if (self.registration && self.registration.sync) {
    self.registration.sync.register('background-sync-cache-cleanup');
  }
}, 1000 * 60 * 60 * 24);

log(`Service Worker loaded - verze ${CONFIG.version}`, {
  caches: Object.keys(CACHE_NAMES).length,
  coreFiles: CORE_FILES.length,
  pages: PAGES_TO_CACHE.length,
  assets: ASSETS_TO_CACHE.length
});